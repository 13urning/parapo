import { BadRequestException } from '@nestjs/common';
import { calculateFare, FareMatrixParams } from './fare-calculator';

const trad: FareMatrixParams = { baseFare: 13, baseKm: 4, perKmRate: 1.8, discountPercent: 20 };

describe('calculateFare', () => {
  it('charges the base fare within the base distance', () => {
    expect(calculateFare(1, trad, 'REGULAR')).toEqual({
      regularFare: 13,
      discountApplied: false,
      fare: 13,
    });
    expect(calculateFare(4, trad, 'REGULAR').fare).toBe(13);
  });

  it('rounds succeeding kilometres up', () => {
    // 4.1 km -> 1 extra km -> 14.80 -> 14.75
    expect(calculateFare(4.1, trad, 'REGULAR').fare).toBe(14.75);
    // 6 km -> 2 extra km -> 16.60 -> 16.50
    expect(calculateFare(6, trad, 'REGULAR').fare).toBe(16.5);
    // 6.01 km -> 3 extra km -> 18.40 -> 18.50
    expect(calculateFare(6.01, trad, 'REGULAR').fare).toBe(18.5);
  });

  it('applies the discount to discounted categories only', () => {
    const regular = calculateFare(6, trad, 'REGULAR');
    for (const cat of ['STUDENT', 'SENIOR', 'PWD'] as const) {
      const r = calculateFare(6, trad, cat);
      expect(r.discountApplied).toBe(true);
      expect(r.regularFare).toBe(regular.regularFare);
      // 16.60 * 0.8 = 13.28 -> 13.25
      expect(r.fare).toBe(13.25);
    }
    expect(regular.discountApplied).toBe(false);
  });

  it('rounds to the nearest 0.25', () => {
    const m: FareMatrixParams = { baseFare: 10.1, baseKm: 1, perKmRate: 0, discountPercent: 0 };
    expect(calculateFare(1, m, 'REGULAR').fare).toBe(10);
    expect(calculateFare(1, { ...m, baseFare: 10.13 }, 'REGULAR').fare).toBe(10.25);
    expect(calculateFare(1, { ...m, baseFare: 10.37 }, 'REGULAR').fare).toBe(10.25);
    expect(calculateFare(1, { ...m, baseFare: 10.38 }, 'REGULAR').fare).toBe(10.5);
  });

  it('handles the UV Express matrix (1 km base)', () => {
    const uv: FareMatrixParams = { baseFare: 2.4, baseKm: 1, perKmRate: 2.4, discountPercent: 20 };
    // 10 km -> 9 extra -> 24.00
    expect(calculateFare(10, uv, 'REGULAR').fare).toBe(24);
    expect(calculateFare(10, uv, 'STUDENT').fare).toBe(19.25);
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid distance %p with 400', (d) => {
    expect(() => calculateFare(d, trad, 'REGULAR')).toThrow(BadRequestException);
  });
});
