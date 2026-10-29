import { ApiError } from './api/errors';
import type { FareQuote, VehicleType } from './api/types';
import { cheapestVehicle, defaultVehicle, resolveSelected, toVehicleQuote, type VehicleQuote } from './quotes';

const quote = (vehicleType: VehicleType, fare: number): FareQuote => ({
  vehicleType,
  distanceKm: 6.8,
  fareCategory: 'STUDENT',
  regularFare: fare * 1.25,
  discountApplied: true,
  fare,
  matrixId: `m-${vehicleType}`,
  matrixEffectiveDate: '2026-01-01',
});
const ready = (v: VehicleType, fare: number): VehicleQuote => ({ vehicleType: v, status: 'ready', quote: quote(v, fare) });
const none = (v: VehicleType, status: VehicleQuote['status'] = 'unavailable'): VehicleQuote => ({ vehicleType: v, status });

describe('toVehicleQuote', () => {
  it('is idle until a distance exists', () => {
    expect(toVehicleQuote('UV_EXPRESS', { status: 'pending', fetchStatus: 'idle' }, false).status).toBe('idle');
  });

  it('is loading while the request is in flight', () => {
    expect(toVehicleQuote('UV_EXPRESS', { status: 'pending', fetchStatus: 'fetching' }, true).status).toBe('loading');
  });

  it('carries the quote when it succeeds', () => {
    const q = quote('UV_EXPRESS', 26);
    expect(toVehicleQuote('UV_EXPRESS', { status: 'success', fetchStatus: 'idle', data: q }, true)).toEqual({
      vehicleType: 'UV_EXPRESS',
      status: 'ready',
      quote: q,
    });
  });

  it('treats a 404 as "no published fare", not as a failure', () => {
    const r = toVehicleQuote('UV_EXPRESS', { status: 'error', fetchStatus: 'idle', error: new ApiError(404, 'none') }, true);
    expect(r.status).toBe('unavailable');
  });

  it('keeps other failures as errors', () => {
    const r = toVehicleQuote('UV_EXPRESS', { status: 'error', fetchStatus: 'idle', error: new ApiError(500, 'boom') }, true);
    expect(r.status).toBe('error');
  });
});

describe('cheapestVehicle', () => {
  it('picks the lowest fare of the three', () => {
    const list = [ready('TRADITIONAL_JEEPNEY', 15), ready('MODERN_JEEPNEY', 18), ready('UV_EXPRESS', 26)];
    expect(cheapestVehicle(list)).toBe('TRADITIONAL_JEEPNEY');
    expect(cheapestVehicle([ready('TRADITIONAL_JEEPNEY', 20), ready('MODERN_JEEPNEY', 18), ready('UV_EXPRESS', 26)])).toBe(
      'MODERN_JEEPNEY',
    );
  });

  it('ignores vehicles that have no published fare', () => {
    const list = [none('TRADITIONAL_JEEPNEY'), ready('MODERN_JEEPNEY', 18), ready('UV_EXPRESS', 26)];
    expect(cheapestVehicle(list)).toBe('MODERN_JEEPNEY');
  });

  it('does not tag anything when there is nothing to compare', () => {
    expect(cheapestVehicle([none('TRADITIONAL_JEEPNEY'), ready('MODERN_JEEPNEY', 18), none('UV_EXPRESS')])).toBeNull();
    expect(cheapestVehicle([ready('TRADITIONAL_JEEPNEY', 18), ready('MODERN_JEEPNEY', 18)])).toBeNull();
    expect(cheapestVehicle([])).toBeNull();
  });

  it('ignores rows that are still loading', () => {
    const list = [none('TRADITIONAL_JEEPNEY', 'loading'), ready('MODERN_JEEPNEY', 18), ready('UV_EXPRESS', 26)];
    expect(cheapestVehicle(list)).toBe('MODERN_JEEPNEY');
  });
});

describe('defaultVehicle and resolveSelected', () => {
  const list = [ready('TRADITIONAL_JEEPNEY', 15), ready('MODERN_JEEPNEY', 18), none('UV_EXPRESS')];

  it('defaults to the cheapest, even when only one vehicle is priced', () => {
    expect(defaultVehicle(list)).toBe('TRADITIONAL_JEEPNEY');
    expect(defaultVehicle([none('TRADITIONAL_JEEPNEY'), none('MODERN_JEEPNEY'), ready('UV_EXPRESS', 26)])).toBe('UV_EXPRESS');
    expect(defaultVehicle([none('TRADITIONAL_JEEPNEY')])).toBeNull();
  });

  it('keeps the rider’s pick while it can be chosen', () => {
    expect(resolveSelected('MODERN_JEEPNEY', list)).toBe('MODERN_JEEPNEY');
  });

  it('falls back to the default when the pick has no fare or nothing is picked', () => {
    expect(resolveSelected('UV_EXPRESS', list)).toBe('TRADITIONAL_JEEPNEY');
    expect(resolveSelected(null, list)).toBe('TRADITIONAL_JEEPNEY');
  });
});
