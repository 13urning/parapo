import { NotFoundException } from '@nestjs/common';
import { FaresService } from '../fares/fares.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateTripDto } from './dto';
import { TripsService } from './trips.service';

const matrix = {
  id: 'm1',
  vehicleType: 'TRADITIONAL_JEEPNEY',
  baseFare: 13,
  baseKm: 4,
  perKmRate: 1.8,
  discountPercent: 20,
  effectiveDate: new Date('2026-01-01'),
  status: 'PUBLISHED',
};

const dto: CreateTripDto = {
  originLabel: 'A',
  originLat: 14.6,
  originLng: 121,
  destLabel: 'B',
  destLat: 14.7,
  destLng: 121.1,
  vehicleType: 'TRADITIONAL_JEEPNEY',
  distanceKm: 6,
  estimated: false,
};

function setup(category: 'REGULAR' | 'STUDENT' = 'STUDENT') {
  const prisma = {
    fareMatrix: { findFirst: jest.fn().mockResolvedValue(matrix) },
    trip: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 't1', createdAt: new Date(), ...data }),
        ),
      deleteMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { fare: 26.5 }, _count: { _all: 2 } }),
    },
  };
  const users = { findById: jest.fn().mockResolvedValue({ id: 'u1', fareCategory: category }) };
  const fares = new FaresService(
    prisma as unknown as PrismaService,
    users as unknown as UsersService,
  );
  const service = new TripsService(
    prisma as unknown as PrismaService,
    fares,
    users as unknown as UsersService,
  );
  return { prisma, service };
}

describe('TripsService', () => {
  it('recomputes the fare server-side and ignores any client-supplied fare', async () => {
    const { prisma, service } = setup('STUDENT');
    const trip = await service.create('u1', { ...dto, fare: 0.01 } as CreateTripDto);
    const data = prisma.trip.create.mock.calls[0][0].data;
    expect(data.fare).toBe(13.25); // 16.60 * 0.8 -> 13.25
    expect(data.fareCategory).toBe('STUDENT');
    expect(data.userId).toBe('u1');
    expect(trip.fare).toBe(13.25);
    expect(trip).not.toHaveProperty('userId');
  });

  it('uses the regular fare for REGULAR users', async () => {
    const { service } = setup('REGULAR');
    expect((await service.create('u1', dto)).fare).toBe(16.5);
  });

  it('scopes list and summary by the current user', async () => {
    const { prisma, service } = setup();
    await service.list('u1', 2, 10);
    expect(prisma.trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' }, skip: 10, take: 10 }),
    );
    const s = await service.summary('u1');
    expect(s).toEqual({ monthTotal: 26.5, monthTrips: 2, allTimeTrips: 0 });
    expect(prisma.trip.aggregate.mock.calls[0][0].where.userId).toBe('u1');
  });

  it('deletes only trips owned by the caller', async () => {
    const { prisma, service } = setup();
    prisma.trip.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.remove('u1', 't1')).resolves.toBeUndefined();
    expect(prisma.trip.deleteMany).toHaveBeenCalledWith({ where: { id: 't1', userId: 'u1' } });
  });

  it('returns 404 when the trip does not exist or belongs to someone else', async () => {
    const { prisma, service } = setup();
    prisma.trip.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.remove('attacker', 't1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
