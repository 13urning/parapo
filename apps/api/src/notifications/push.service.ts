import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { SecretsService } from '../config/secrets.service';
import { PrismaService } from '../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly secrets: SecretsService,
  ) {}

  async getPublicKey(): Promise<string> {
    return (await this.secrets.getVapidKeys()).publicKey;
  }

  /**
   * Sends to every subscription. Never throws: failures are logged, and subscriptions the push
   * service reports as gone (404/410) are deleted.
   */
  async sendToAll(payload: PushPayload): Promise<void> {
    try {
      const keys = await this.secrets.getVapidKeys();
      const subs = await this.prisma.pushSubscription.findMany();
      const body = JSON.stringify(payload);
      const results = await Promise.allSettled(
        subs.map((s) =>
          webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            body,
            {
              TTL: 60 * 60 * 24,
              timeout: 5000,
              vapidDetails: {
                subject: keys.subject,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
              },
            },
          ),
        ),
      );
      const gone: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const status = (r.reason as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) gone.push(subs[i].id);
          else this.logger.warn(`Push failed (status ${status ?? 'n/a'})`);
        }
      });
      if (gone.length > 0) {
        await this.prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
      }
      this.logger.log(
        `Push sent: ${subs.length - results.filter((r) => r.status === 'rejected').length}/${subs.length}`,
      );
    } catch (e) {
      this.logger.error(`Push fan-out failed: ${(e as Error).message}`);
    }
  }
}
