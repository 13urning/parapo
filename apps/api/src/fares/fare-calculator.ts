import { BadRequestException } from '@nestjs/common';
import { FareCategory } from '@prisma/client';

export interface FareMatrixParams {
  baseFare: number;
  baseKm: number;
  perKmRate: number;
  discountPercent: number;
}

export interface FareResult {
  regularFare: number;
  discountApplied: boolean;
  fare: number;
}

const round = (n: number, places: number): number => {
  const f = 10 ** places;
  return Math.round((n + Number.EPSILON) * f) / f;
};

/** Round to the nearest PHP 0.25. */
export const roundToQuarter = (n: number): number => Math.round(round(n, 6) * 4) / 4;

/**
 * Pure fare formula.
 * extraKm = max(0, ceil(distanceKm - baseKm)); regular = baseFare + extraKm * perKmRate;
 * STUDENT/SENIOR/PWD pay regular * (1 - discountPercent/100); result rounded to PHP 0.25.
 */
export function calculateFare(
  distanceKm: number,
  matrix: FareMatrixParams,
  category: FareCategory,
): FareResult {
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new BadRequestException('distanceKm must be greater than 0');
  }
  const extraKm = Math.max(0, Math.ceil(round(distanceKm - matrix.baseKm, 6)));
  const regular = matrix.baseFare + extraKm * matrix.perKmRate;
  const discountApplied = category !== FareCategory.REGULAR;
  const raw = discountApplied ? regular * (1 - matrix.discountPercent / 100) : regular;
  return {
    regularFare: roundToQuarter(regular),
    discountApplied,
    fare: roundToQuarter(raw),
  };
}
