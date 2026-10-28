import type { VehicleType } from './types';

/** Query-key factory: one place to define and invalidate cache entries. */
export const queryKeys = {
  session: ['session'] as const,
  places: {
    search: (q: string) => ['places', 'search', q] as const,
    route: (from: [number, number] | null, to: [number, number] | null) => ['places', 'route', from, to] as const,
  },
  fares: {
    quote: (vehicleType: VehicleType, distanceKm: number) => ['fares', 'quote', vehicleType, distanceKm] as const,
  },
  trips: {
    all: ['trips'] as const,
    list: (page: number, pageSize: number) => ['trips', 'list', page, pageSize] as const,
    summary: ['trips', 'summary'] as const,
  },
  matrices: {
    all: ['matrices'] as const,
    list: (status?: string) => ['matrices', 'list', status ?? 'all'] as const,
    detail: (id: string) => ['matrices', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: ['notifications', 'list'] as const,
  },
  push: { publicKey: ['push', 'public-key'] as const },
  analytics: { summary: (days: number) => ['analytics', 'summary', days] as const },
};
