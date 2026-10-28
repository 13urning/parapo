import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const MAX_SUBSCRIPTIONS_PER_USER = 5;

/** Browser push services we accept. Anything else is rejected to avoid server-side requests to arbitrary hosts. */
const ALLOWED_HOSTS: (string | RegExp)[] = [
  'fcm.googleapis.com',
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.push\.services\.mozilla\.com$/,
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.notify\.windows\.com$/,
  'web.push.apple.com',
  /^[a-z0-9-]+(\.[a-z0-9-]+)*\.push\.apple\.com$/,
];

export function isAllowedPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return ALLOWED_HOSTS.some((h) => (typeof h === 'string' ? h === host : h.test(host)));
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const [rows, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      items: rows.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        url: n.url,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      unread,
    };
  }

  async markRead(userId: string, id: string): Promise<void> {
    const owned = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!owned) throw new NotFoundException('Notification not found');
    if (owned.readAt) return;
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async subscribe(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void> {
    if (!isAllowedPushEndpoint(endpoint)) {
      throw new BadRequestException('Unsupported push endpoint');
    }
    const existing = await this.prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (existing && existing.userId !== userId) {
      // Never rebind an endpoint that belongs to another account.
      throw new ConflictException('Push endpoint is already registered');
    }
    if (existing) {
      await this.prisma.pushSubscription.updateMany({
        where: { id: existing.id, userId },
        data: { p256dh, auth },
      });
    } else {
      try {
        await this.prisma.pushSubscription.create({ data: { userId, endpoint, p256dh, auth } });
      } catch (e) {
        // Lost a race with another account registering the same endpoint.
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException('Push endpoint is already registered');
        }
        throw e;
      }
    }
    await this.enforceLimit(userId);
  }

  /** Keeps at most MAX_SUBSCRIPTIONS_PER_USER per user, deleting the oldest first. */
  private async enforceLimit(userId: string): Promise<void> {
    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const excess = subs.length - MAX_SUBSCRIPTIONS_PER_USER;
    if (excess > 0) {
      await this.prisma.pushSubscription.deleteMany({
        where: { userId, id: { in: subs.slice(0, excess).map((x) => x.id) } },
      });
    }
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
  }
}
