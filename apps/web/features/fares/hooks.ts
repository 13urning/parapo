'use client';

import { useQuery } from '@tanstack/react-query';
import { matricesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/keys';

/** Published matrices (one per vehicle type). Shared by the Fares screen and the Plan screen's "show the working". */
export function usePublishedMatrices(enabled = true) {
  return useQuery({
    queryKey: queryKeys.matrices.list('PUBLISHED'),
    queryFn: () => matricesApi.list('PUBLISHED'),
    enabled,
  });
}
