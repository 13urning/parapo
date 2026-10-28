import { Injectable, NotFoundException } from '@nestjs/common';
import { FareCategory, VehicleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { calculateFare } from './fare-calculator';

export interface FareQuote {
  vehicleType: VehicleType;
  distanceKm: number;
  fareCategory: FareCategory;
  regularFare: number;
  discountApplied: boolean;
  fare: number;
  matrixId: string;
  matrixEffectiveDate: Date;
}

@Injectable()
export class FaresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async quote(
    vehicleType: VehicleType,
    distanceKm: number,
    fareCategory: FareCategory,
  ): Promise<FareQuote> {
    const matrix = await this.prisma.fareMatrix.findFirst({
      where: { vehicleType, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
    if (!matrix) throw new NotFoundException('No published fare matrix for this vehicle type');
    const result = calculateFare(distanceKm, matrix, fareCategory);
    return {
      vehicleType,
      distanceKm,
      fareCategory,
      ...result,
      matrixId: matrix.id,
      matrixEffectiveDate: matrix.effectiveDate,
    };
  }

  async quoteForUser(
    userId: string,
    vehicleType: VehicleType,
    distanceKm: number,
    fareCategory?: FareCategory,
  ): Promise<FareQuote> {
    let category = fareCategory;
    if (!category) {
      const user = await this.users.findById(userId);
      category = user?.fareCategory ?? FareCategory.REGULAR;
    }
    return this.quote(vehicleType, distanceKm, category);
  }
}
