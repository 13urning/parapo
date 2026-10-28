import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    // Upsert by endpoint; re-subscribing from the same browser rebinds it to the current user.
    await this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth },
      update: { userId, p256dh, auth },
    });
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
  }
}
