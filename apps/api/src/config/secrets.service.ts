import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfig } from './app-config';

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

/**
 * Resolves JWT / VAPID secrets: env first, else generate once and persist in AppSecret.
 * Persistence is create-if-absent on a unique key followed by a re-read, so concurrent
 * first boots converge on a single stored value.
 */
@Injectable()
export class SecretsService {
  private jwt?: Promise<string>;
  private vapid?: Promise<VapidKeys>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
  ) {}

  getJwtSecret(): Promise<string> {
    this.jwt ??= this.resolve('JWT_SECRET', this.config.jwtSecretEnv, () =>
      randomBytes(64).toString('hex'),
    );
    return this.jwt;
  }

  getVapidKeys(): Promise<VapidKeys> {
    this.vapid ??= this.loadVapid();
    return this.vapid;
  }

  private async loadVapid(): Promise<VapidKeys> {
    const { vapidPublicEnv, vapidPrivateEnv, vapidSubject } = this.config;
    if (vapidPublicEnv && vapidPrivateEnv) {
      return { publicKey: vapidPublicEnv, privateKey: vapidPrivateEnv, subject: vapidSubject };
    }
    // Generate as a pair and store as a single row so the halves can never mismatch.
    const pair = await this.resolve('VAPID_KEYPAIR', undefined, () =>
      JSON.stringify(webpush.generateVAPIDKeys()),
    );
    const parsed = JSON.parse(pair) as { publicKey: string; privateKey: string };
    return { ...parsed, subject: vapidSubject };
  }

  private async resolve(
    key: string,
    fromEnv: string | undefined,
    generate: () => string,
  ): Promise<string> {
    if (fromEnv) return fromEnv;
    const existing = await this.prisma.appSecret.findUnique({ where: { key } });
    if (existing) return existing.value;
    // skipDuplicates => ON CONFLICT DO NOTHING; the loser of a race keeps the winner's value.
    await this.prisma.appSecret.createMany({
      data: [{ key, value: generate() }],
      skipDuplicates: true,
    });
    const stored = await this.prisma.appSecret.findUnique({ where: { key } });
    if (!stored) throw new Error(`Failed to persist secret ${key}`);
    return stored.value;
  }
}
