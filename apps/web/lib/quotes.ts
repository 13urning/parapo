import type { FareQuote, VehicleType } from './api/types';
import { ApiError } from './api/errors';

/**
 * One row of the "Choose a ride" list. `unavailable` means the API answered 404: that vehicle
 * has no published fare matrix, which is a normal state, not an error.
 */
export type QuoteStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

export interface VehicleQuote {
  vehicleType: VehicleType;
  status: QuoteStatus;
  quote?: FareQuote;
}

interface QueryLike {
  status: 'pending' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
  data?: FareQuote;
  error?: unknown;
}

/** Maps a TanStack Query result onto the row state. */
export function toVehicleQuote(vehicleType: VehicleType, q: QueryLike, enabled: boolean): VehicleQuote {
  if (!enabled) return { vehicleType, status: 'idle' };
  if (q.status === 'success' && q.data) return { vehicleType, status: 'ready', quote: q.data };
  if (q.status === 'error') {
    return { vehicleType, status: q.error instanceof ApiError && q.error.status === 404 ? 'unavailable' : 'error' };
  }
  return { vehicleType, status: 'loading' };
}

const ready = (list: VehicleQuote[]) => list.filter((v): v is VehicleQuote & { quote: FareQuote } => v.status === 'ready' && !!v.quote);

/**
 * The vehicle to tag "Cheapest". Needs at least two priced vehicles to compare, and a real
 * difference between them: calling something cheapest when everything costs the same is noise.
 * Ties resolve to the earlier vehicle in list order.
 */
export function cheapestVehicle(list: VehicleQuote[]): VehicleType | null {
  const priced = ready(list);
  if (priced.length < 2) return null;
  const min = priced.reduce((a, b) => (b.quote.fare < a.quote.fare ? b : a));
  const hasDearer = priced.some((v) => v.quote.fare > min.quote.fare);
  return hasDearer ? min.vehicleType : null;
}

/** Default selection: the cheapest vehicle, else the first one that has a price. */
export function defaultVehicle(list: VehicleQuote[]): VehicleType | null {
  const priced = ready(list);
  if (priced.length === 0) return null;
  const cheapest = priced.reduce((a, b) => (b.quote.fare < a.quote.fare ? b : a));
  return cheapest.vehicleType;
}

/** The user's explicit pick if it can still be chosen, otherwise the default. */
export function resolveSelected(picked: VehicleType | null, list: VehicleQuote[]): VehicleType | null {
  if (picked && list.some((v) => v.vehicleType === picked && v.status === 'ready')) return picked;
  return defaultVehicle(list);
}
