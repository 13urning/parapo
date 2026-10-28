import { computeFare } from './fare';

const traditional = { baseFare: 13, baseKm: 4, perKmRate: 1.8, discountPercent: 20 };
const uv = { baseFare: 2.4, baseKm: 1, perKmRate: 2.4, discountPercent: 20 };

describe('computeFare', () => {
  it('charges only the base fare within the base distance', () => {
    expect(computeFare(traditional, 3, 'REGULAR')).toEqual({ regularFare: 13, fare: 13, discounted: false });
    expect(computeFare(traditional, 4, 'REGULAR').fare).toBe(13);
  });

  it('rounds partial extra kilometres up', () => {
    // 4.01 km -> 1 extra km -> 14.80 -> nearest 0.25 = 14.75
    expect(computeFare(traditional, 4.01, 'REGULAR').fare).toBe(14.75);
  });

  it('rounds the final fare to the nearest 0.25', () => {
    // 10 km -> 13 + 6 * 1.8 = 23.80 -> 23.75
    expect(computeFare(traditional, 10, 'REGULAR').fare).toBe(23.75);
  });

  it.each(['STUDENT', 'SENIOR', 'PWD'] as const)('applies the discount for %s', (category) => {
    const r = computeFare(traditional, 10, category);
    expect(r.discounted).toBe(true);
    expect(r.regularFare).toBe(23.75);
    expect(r.fare).toBe(19); // 23.80 * 0.8 = 19.04 -> 19.00
  });

  it('does not discount regular riders', () => {
    expect(computeFare(traditional, 10).discounted).toBe(false);
  });

  it('handles the UV Express one-kilometre base', () => {
    expect(computeFare(uv, 5, 'REGULAR').fare).toBe(12);
    expect(computeFare(uv, 5, 'STUDENT').fare).toBe(9.5);
  });

  it('rejects non-positive distances', () => {
    expect(() => computeFare(traditional, 0)).toThrow(RangeError);
    expect(() => computeFare(traditional, -2)).toThrow(RangeError);
    expect(() => computeFare(traditional, NaN)).toThrow(RangeError);
  });
});
