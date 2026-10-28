import { Injectable, NotFoundException } from '@nestjs/common';
import { FareCategory, Trip } from '@prisma/client';
import { startOfMonthManila } from '../common/time';
import { FaresService } from '../fares/fares.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateTripDto } from './dto';

export const toTripDto = (t: Trip) => ({
  id: t.id,
  originLabel: t.originLabel,
  destLabel: t.destLabel,
  originLat: t.originLat,
  originLng: t.originLng,
  destLat: t.destLat,
  destLng: t.destLng,
  vehicleType: t.vehicleType,
  distanceKm: t.distanceKm,
  estimated: t.estimated,
  fareCategory: t.fareCategory,
  fare: t.fare,
  createdAt: t.createdAt,
});

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fares: FaresService,
    private readonly users: UsersService,
  ) {}

  async create(userId: string, dto: CreateTripDto) {
    const user = await this.users.findById(userId);
    const category = user?.fareCategory ?? FareCategory.REGULAR;
    const distanceKm = Math.round(dto.distanceKm * 100) / 100;
    // The fare is always recomputed here; any client-supplied fare is ignored (and rejected by DTO).
    const quote = await this.fares.quote(dto.vehicleType, distanceKm, category);
    const trip = await this.prisma.trip.create({
      data: {
        userId,
        originLabel: dto.originLabel,
        originLat: dto.originLat,
        originLng: dto.originLng,
        destLabel: dto.destLabel,
        destLat: dto.destLat,
        destLng: dto.destLng,
        vehicleType: dto.vehicleType,
        distanceKm,
        estimated: dto.estimated,
        fareCategory: category,
        fare: quote.fare,
      },
    });
    return toTripDto(trip);
  }

  async list(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [rows, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.trip.count({ where }),
    ]);
    return { items: rows.map(toTripDto), page, pageSize, total };
  }

  async summary(userId: string) {
    const monthStart = startOfMonthManila();
    const [month, allTimeTrips] = await Promise.all([
      this.prisma.trip.aggregate({
        where: { userId, createdAt: { gte: monthStart } },
        _sum: { fare: true },
        _count: { _all: true },
      }),
      this.prisma.trip.count({ where: { userId } }),
    ]);
    return {
      monthTotal: Math.round((month._sum.fare ?? 0) * 100) / 100,
      monthTrips: month._count._all,
      allTimeTrips,
    };
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.trip.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException('Trip not found');
  }
}
