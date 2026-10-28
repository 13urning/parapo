import type { FareCategory, FareMatrix } from './api/types';

export type FareRule = Pick<FareMatrix, 'baseFare' | 'baseKm' | 'perKmRate' | 'discountPercent'>;

export const DISCOUNTED_CATEGORIES: FareCategory[] = ['STUDENT', 'SENIOR', 'PWD'];

const roundToQuarter = (n: number) => Math.round((n + Number.EPSILON) * 4) / 4;

/**
 * Mirrors the fare formula in Docs/api-contract.md. DISPLAY ONLY: the server is the
 * source of truth for quotes and recomputes every saved trip.
 */
export function computeFare(rule: FareRule, distanceKm: number, category: FareCategory = 'REGULAR') {
  if (!(distanceKm > 0)) throw new RangeError('distanceKm must be greater than 0');
  const extraKm = Math.max(0, Math.ceil(distanceKm - rule.baseKm));
  const regular = rule.baseFare + extraKm * rule.perKmRate;
  const discounted = DISCOUNTED_CATEGORIES.includes(category);
  const fare = discounted ? regular * (1 - rule.discountPercent / 100) : regular;
  return {
    regularFare: roundToQuarter(regular),
    fare: roundToQuarter(fare),
    discounted,
  };
}
