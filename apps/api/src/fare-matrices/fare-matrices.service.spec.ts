import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PushService } from '../notifications/push.service';
import { PrismaService } from '../prisma/prisma.service';
import { FareMatricesService } from './fare-matrices.service';

const draft = {
  id: 'd1',
  vehicleType: 'MODERN_JEEPNEY',
  baseFare: 15,
  baseKm: 4,
  perKmRate: 2.2,
  discountPercent: 20,
  effectiveDate: new Date(),
  status: 'DRAFT',
  notes: null,
  publishedAt: null,
  createdAt: new Date(),
};

function setup() {
  const prisma = {
    fareMatrix: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...draft, ...data })),
      deleteMany: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(2),
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(prisma));
  const push = { sendToAll: jest.fn().mockResolvedValue(undefined) };
  const service = new FareMatricesService(
    prisma as unknown as PrismaService,
    push as unknown as PushService,
  );
  return { prisma, push, service };
}

describe('FareMatricesService', () => {
  describe('publish', () => {
    it('archives the previous PUBLISHED matrix and publishes the draft inside the transaction', async () => {
      const { prisma, push, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);

      const result = await service.publish('d1');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.fareMatrix.updateMany).toHaveBeenCalledWith({
        where: { vehicleType: 'MODERN_JEEPNEY', status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      });
      expect(prisma.fareMatrix.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'd1' },
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
      expect(result.status).toBe('PUBLISHED');
      expect(push.sendToAll).toHaveBeenCalledTimes(1);
    });

    it('creates notifications after commit with a single INSERT ... SELECT from User', async () => {
      const { prisma, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);
      const order: string[] = [];
      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
        const r = await fn(prisma);
        order.push('commit');
        return r;
      });
      prisma.$executeRaw.mockImplementation(() => {
        order.push('notify');
        return Promise.resolve(2);
      });

      await service.publish('d1');

      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
      const [strings, ...params] = prisma.$executeRaw.mock.calls[0] as [string[], ...string[]];
      const sql = strings.join('?');
      expect(sql).toContain('INSERT INTO "Notification"');
      expect(sql).toContain('FROM "User"');
      expect(params).toEqual(['Fare update', expect.stringContaining('Modern jeepney'), '/']);
      expect(order).toEqual(['commit', 'notify']);
    });

    it('maps a unique-index violation (P2002) to 409', async () => {
      const { prisma, push, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);
      prisma.fareMatrix.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
      );
      await expect(service.publish('d1')).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.$executeRaw).not.toHaveBeenCalled();
      expect(push.sendToAll).not.toHaveBeenCalled();
    });

    it('does not push when the transaction fails', async () => {
      const { prisma, push, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);
      prisma.fareMatrix.update.mockRejectedValue(new Error('db down'));
      await expect(service.publish('d1')).rejects.toThrow('db down');
      expect(push.sendToAll).not.toHaveBeenCalled();
      expect(prisma.$executeRaw).not.toHaveBeenCalled();
    });

    it('does not surface notification-insert or push failures to the caller', async () => {
      const { prisma, push, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);
      prisma.$executeRaw.mockRejectedValue(new Error('insert failed'));
      push.sendToAll.mockRejectedValue(new Error('push down'));
      await expect(service.publish('d1')).resolves.toBeDefined();
      expect(push.sendToAll).toHaveBeenCalledTimes(1);
    });

    it('returns 409 for non-DRAFT and 404 for unknown', async () => {
      const { prisma, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue({ ...draft, status: 'PUBLISHED' });
      await expect(service.publish('d1')).rejects.toBeInstanceOf(ConflictException);
      prisma.fareMatrix.findUnique.mockResolvedValue(null);
      await expect(service.publish('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update / remove', () => {
    it.each(['PUBLISHED', 'ARCHIVED'])('rejects editing a %s matrix with 409', async (status) => {
      const { prisma, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue({ ...draft, status });
      await expect(service.update('d1', { baseFare: 20 })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.fareMatrix.updateMany).not.toHaveBeenCalled();
    });

    it('edits a DRAFT', async () => {
      const { prisma, service } = setup();
      prisma.fareMatrix.findUnique.mockResolvedValue(draft);
      await service.update('d1', { baseFare: 20 });
      expect(prisma.fareMatrix.updateMany).toHaveBeenCalledWith({
        where: { id: 'd1', status: 'DRAFT' },
        data: { baseFare: 20 },
      });
    });

    it('deletes only drafts (409 for others, 404 for unknown)', async () => {
      const { prisma, service } = setup();
      prisma.fareMatrix.deleteMany.mockResolvedValue({ count: 0 });
      prisma.fareMatrix.findUnique.mockResolvedValue({ ...draft, status: 'PUBLISHED' });
      await expect(service.remove('d1')).rejects.toBeInstanceOf(ConflictException);
      prisma.fareMatrix.findUnique.mockResolvedValue(null);
      await expect(service.remove('d1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('list', () => {
    it('limits commuters to PUBLISHED regardless of the requested status', async () => {
      const { prisma, service } = setup();
      await service.list('COMMUTER', 'DRAFT');
      expect(prisma.fareMatrix.findMany.mock.calls[0][0].where).toEqual({ status: 'PUBLISHED' });
    });
    it('lets admins filter by status', async () => {
      const { prisma, service } = setup();
      await service.list('ADMIN', 'DRAFT');
      expect(prisma.fareMatrix.findMany.mock.calls[0][0].where).toEqual({ status: 'DRAFT' });
    });
  });
});
