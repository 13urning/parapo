import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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

  describe('push subscriptions', () => {
    const FCM = 'https://fcm.googleapis.com/fcm/send/abc';

    it.each([
      FCM,
      'https://updates.push.services.mozilla.com/wpush/v2/x',
      'https://db5p.notify.windows.com/w/?token=x',
      'https://web.push.apple.com/QAbc',
      'https://api.push.apple.com/3/device/x',
    ])('accepts allow-listed host %s', async (endpoint) => {
      const { prisma, service } = setup();
      await service.subscribe('u1', endpoint, 'p', 'a');
      expect(prisma.pushSubscription.create).toHaveBeenCalledWith({
        data: { userId: 'u1', endpoint, p256dh: 'p', auth: 'a' },
      });
    });

    it.each([
      'http://fcm.googleapis.com/x',
      'https://evil.example.com/x',
      'https://fcm.googleapis.com.evil.test/x',
      'https://evilpush.apple.com.attacker.io/x',
      'https://notify.windows.com.evil.test/x',
      'https://user:pw@fcm.googleapis.com/x',
      'https://127.0.0.1/x',
      'not a url',
    ])('rejects %s with 400', async (endpoint) => {
      const { prisma, service } = setup();
      await expect(service.subscribe('u1', endpoint, 'p', 'a')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.pushSubscription.create).not.toHaveBeenCalled();
    });

    it('returns 409 and leaves the row untouched when the endpoint belongs to another user', async () => {
      const { prisma, service } = setup();
      prisma.pushSubscription.findUnique.mockResolvedValue({
        id: 's1',
        userId: 'other',
        endpoint: FCM,
      });
      await expect(service.subscribe('u1', FCM, 'p', 'a')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.pushSubscription.create).not.toHaveBeenCalled();
      expect(prisma.pushSubscription.updateMany).not.toHaveBeenCalled();
      expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
    });

    it('maps a create race (P2002) to 409', async () => {
      const { prisma, service } = setup();
      prisma.pushSubscription.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
      );
      await expect(service.subscribe('u1', FCM, 'p', 'a')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("updates the keys when the endpoint is the caller's own", async () => {
      const { prisma, service } = setup();
      prisma.pushSubscription.findUnique.mockResolvedValue({
        id: 's1',
        userId: 'u1',
        endpoint: FCM,
      });
      await service.subscribe('u1', FCM, 'newp', 'newa');
      expect(prisma.pushSubscription.updateMany).toHaveBeenCalledWith({
        where: { id: 's1', userId: 'u1' },
        data: { p256dh: 'newp', auth: 'newa' },
      });
      expect(prisma.pushSubscription.create).not.toHaveBeenCalled();
    });

    it('keeps at most 5 subscriptions per user, removing the oldest', async () => {
      const { prisma, service } = setup();
      prisma.pushSubscription.findMany.mockResolvedValue(
        ['s1', 's2', 's3', 's4', 's5', 's6', 's7'].map((id) => ({ id })),
      );
      await service.subscribe('u1', FCM, 'p', 'a');
      expect(prisma.pushSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' }, orderBy: { createdAt: 'asc' } }),
      );
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', id: { in: ['s1', 's2'] } },
      });
    });

    it('does not prune when at or under the cap', async () => {
      const { prisma, service } = setup();
      prisma.pushSubscription.findMany.mockResolvedValue(
        ['s1', 's2', 's3', 's4', 's5'].map((id) => ({ id })),
      );
      await service.subscribe('u1', FCM, 'p', 'a');
      expect(prisma.pushSubscription.deleteMany).not.toHaveBeenCalled();
    });

    it('unsubscribe is owner-scoped', async () => {
      const { prisma, service } = setup();
      await service.unsubscribe('u1', FCM);
      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { endpoint: FCM, userId: 'u1' },
      });
    });
  });
});
