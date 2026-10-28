import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

function setup() {
  const prisma = {
    notification: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    pushSubscription: {
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  return { prisma, service: new NotificationsService(prisma as unknown as PrismaService) };
}

describe('NotificationsService', () => {
  it('lists the latest 50 for the user with the unread count', async () => {
    const { prisma, service } = setup();
    const createdAt = new Date();
    prisma.notification.findMany.mockResolvedValue([
      { id: 'n1', userId: 'u1', title: 'T', body: 'B', url: '/', readAt: null, createdAt },
    ]);
    prisma.notification.count.mockResolvedValue(3);

    const res = await service.list('u1');

    expect(res).toEqual({
      items: [{ id: 'n1', title: 'T', body: 'B', url: '/', readAt: null, createdAt }],
      unread: 3,
    });
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' }, take: 50 }),
    );
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'u1', readAt: null },
    });
  });

  it('marks an owned notification read', async () => {
    const { prisma, service } = setup();
    prisma.notification.findFirst.mockResolvedValue({ id: 'n1', userId: 'u1', readAt: null });
    await service.markRead('u1', 'n1');
    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
    });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1', readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });

  it('is a no-op for an already-read notification', async () => {
    const { prisma, service } = setup();
    prisma.notification.findFirst.mockResolvedValue({ id: 'n1', readAt: new Date() });
    await service.markRead('u1', 'n1');
    expect(prisma.notification.updateMany).not.toHaveBeenCalled();
  });

  it("returns 404 for someone else's or unknown notification", async () => {
    const { prisma, service } = setup();
    prisma.notification.findFirst.mockResolvedValue(null);
    await expect(service.markRead('attacker', 'n1')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.notification.updateMany).not.toHaveBeenCalled();
  });

  it("marks all of the caller's unread notifications read", async () => {
    const { prisma, service } = setup();
    await service.markAllRead('u1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });

  it('upserts subscriptions by endpoint bound to the caller; unsubscribe is owner-scoped', async () => {
    const { prisma, service } = setup();
    await service.subscribe('u1', 'https://push.test/e', 'p', 'a');
    expect(prisma.pushSubscription.upsert).toHaveBeenCalledWith({
      where: { endpoint: 'https://push.test/e' },
      create: { userId: 'u1', endpoint: 'https://push.test/e', p256dh: 'p', auth: 'a' },
      update: { userId: 'u1', p256dh: 'p', auth: 'a' },
    });
    await service.unsubscribe('u1', 'https://push.test/e');
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { endpoint: 'https://push.test/e', userId: 'u1' },
    });
  });
});
