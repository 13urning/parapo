'use client';

import { useState } from 'react';
import { EmptyState, PageLoader, Segmented } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { errorMessage } from '@/lib/api/errors';
import type { VehicleType } from '@/lib/api/types';
import { VEHICLE_LABELS, VEHICLE_ROW, VEHICLE_TYPES } from '@/lib/format';
import { useSession } from '@/providers/session-provider';
import { FareCalculator } from './FareCalculator';
import { FareTable } from './FareTable';
import { usePublishedMatrices } from './hooks';

const vehicleOptions = VEHICLE_TYPES.map((v) => ({
  value: v,
  label: VEHICLE_LABELS[v],
  shortLabel: v === 'MODERN_JEEPNEY' ? 'Modern' : VEHICLE_ROW[v].name,
}));

export function PublishedFares() {
  const { user } = useSession();
  const [vehicle, setVehicle] = useState<VehicleType>('TRADITIONAL_JEEPNEY');
  const { data, isPending, error, refetch } = usePublishedMatrices();

  if (isPending) return <PageLoader label="Loading fares" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;

  const matrix = data.find((m) => m.vehicleType === vehicle && m.status === 'PUBLISHED');

  return (
    <div className="space-y-6">
      <Segmented label="Vehicle type" value={vehicle} onChange={setVehicle} options={vehicleOptions} />
      {matrix ? (
        <div key={matrix.id} className="animate-row-in space-y-4">
          <FareCalculator matrix={matrix} category={user?.fareCategory ?? 'REGULAR'} />
          <FareTable matrix={matrix} />
        </div>
      ) : (
        <EmptyState
          title="No published fare yet"
          description={`There is no published matrix for ${VEHICLE_ROW[vehicle].name}.`}
        />
      )}
      <p className="text-[13px] leading-snug text-ink-soft">
        Seeded fares are illustrative LTFRB-style values, not an official LTFRB fare guide. The ride prices on the Plan
        screen come from the server and are authoritative.
      </p>
    </div>
  );
}
