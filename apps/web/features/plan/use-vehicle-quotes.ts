'use client';

import { useQueries } from '@tanstack/react-query';
import { faresApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { VehicleType } from '@/lib/api/types';
import { VEHICLE_TYPES } from '@/lib/format';
import { toVehicleQuote, type VehicleQuote } from '@/lib/quotes';

/**
 * Requests GET /fares/quote for all three vehicle types in parallel, for one resolved distance.
 * A 404 means that vehicle has no published matrix; it is not retried and is reported as `unavailable`.
 */
export function useVehicleQuotes(distanceKm: number | undefined) {
  const enabled = distanceKm !== undefined && distanceKm > 0;
  const results = useQueries({
    queries: VEHICLE_TYPES.map((vehicleType) => ({
      queryKey: queryKeys.fares.quote(vehicleType, distanceKm ?? 0),
      queryFn: () => faresApi.quote(vehicleType, distanceKm!),
      enabled,
      retry: (count: number, err: unknown) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
    })),
  });

  const items: VehicleQuote[] = VEHICLE_TYPES.map((v, i) => toVehicleQuote(v, results[i], enabled));
  const retry = (vehicleType: VehicleType) => {
    const i = VEHICLE_TYPES.indexOf(vehicleType);
    if (i >= 0) void results[i].refetch();
  };
  return { items, retry };
}
