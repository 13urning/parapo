'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, EmptyState, PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { VehicleSelector } from '@/features/plan/VehicleSelector';
import { matricesApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { VehicleType } from '@/lib/api/types';
import { VEHICLE_LABELS, formatDate, formatPeso } from '@/lib/format';
import { FareTable } from './FareTable';

export function PublishedFares() {
  const [vehicle, setVehicle] = useState<VehicleType>('TRADITIONAL_JEEPNEY');
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.matrices.list('PUBLISHED'),
    queryFn: () => matricesApi.list('PUBLISHED'),
  });

  if (isPending) return <PageLoader label="Loading fares" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;

  const matrix = data.find((m) => m.vehicleType === vehicle && m.status === 'PUBLISHED');

  return (
    <div className="space-y-5">
      <VehicleSelector value={vehicle} onChange={setVehicle} />
      {matrix ? (
        <>
          <Card accent="red" title={VEHICLE_LABELS[vehicle]} description={`Effective ${formatDate(matrix.effectiveDate)}`}>
            <p className="text-ink">
              {formatPeso(matrix.baseFare)} covers the first {matrix.baseKm} km, then {formatPeso(matrix.perKmRate)} for
              each additional km (rounded up). Student, senior citizen and PWD fares get {matrix.discountPercent}% off.
              Fares are rounded to the nearest ₱0.25.
            </p>
            {matrix.notes && <p className="mt-2 text-sm text-ink-soft">{matrix.notes}</p>}
          </Card>
          <FareTable matrix={matrix} />
          <p className="text-xs text-ink-faint">Table is for reference. The fare quote on the Plan screen is authoritative.</p>
        </>
      ) : (
        <EmptyState title="No published fare yet" description={`There is no published matrix for ${VEHICLE_LABELS[vehicle]}.`} />
      )}
    </div>
  );
}
