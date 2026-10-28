'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { faresApi, placesApi, tripsApi } from '@/lib/api/endpoints';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { Place, VehicleType } from '@/lib/api/types';
import { FareQuoteCard } from './FareQuoteCard';
import { PlaceCombobox } from './PlaceCombobox';
import { TripMapLoader } from './TripMapLoader';
import { VehicleSelector } from './VehicleSelector';

export function PlanTrip() {
  const qc = useQueryClient();
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [vehicle, setVehicle] = useState<VehicleType>('TRADITIONAL_JEEPNEY');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const from: [number, number] | null = origin ? [origin.lat, origin.lng] : null;
  const to: [number, number] | null = destination ? [destination.lat, destination.lng] : null;

  const route = useQuery({
    queryKey: queryKeys.places.route(from, to),
    queryFn: ({ signal }) => placesApi.route(from!, to!, signal),
    enabled: !!from && !!to,
    staleTime: 10 * 60_000,
  });

  const distanceKm = route.data?.distanceKm;
  const quote = useQuery({
    queryKey: queryKeys.fares.quote(vehicle, distanceKm ?? 0),
    queryFn: () => faresApi.quote(vehicle, distanceKm!),
    enabled: distanceKm !== undefined && distanceKm > 0,
  });

  const tripKey = `${origin?.label}|${destination?.label}|${vehicle}|${distanceKm}`;
  const save = useMutation({
    mutationFn: tripsApi.create,
    onSuccess: () => {
      setSavedKey(tripKey);
      void qc.invalidateQueries({ queryKey: queryKeys.trips.all });
      toast.success('Trip saved to your log.');
    },
    onError: (err) => toast.error(errorMessage(err, 'Could not save the trip.')),
  });

  const onSave = () => {
    if (!origin || !destination || !route.data) return;
    save.mutate({
      originLabel: origin.label,
      originLat: origin.lat,
      originLng: origin.lng,
      destLabel: destination.label,
      destLat: destination.lat,
      destLng: destination.lng,
      vehicleType: vehicle,
      distanceKm: route.data.distanceKm,
      estimated: route.data.estimated,
    });
  };

  const ready = !!origin && !!destination;
  const sameSpot = ready && origin.lat === destination.lat && origin.lng === destination.lng;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="space-y-5">
        <Card accent="blue" title="Where to?" description="Search for a place in the Philippines.">
          <div className="space-y-4">
            <PlaceCombobox label="From" placeholder="e.g. Lawton, Manila" value={origin} onChange={setOrigin} />
            <PlaceCombobox label="To" placeholder="e.g. UP Diliman" value={destination} onChange={setDestination} />
            <VehicleSelector value={vehicle} onChange={setVehicle} />
          </div>
        </Card>

        {sameSpot && <ErrorState message="Pick two different places to calculate a fare." />}
        {ready && !sameSpot && route.isPending && <PageLoader label="Finding the route" />}
        {route.isError && <ErrorState message={errorMessage(route.error)} onRetry={() => route.refetch()} />}
        {route.data && quote.isPending && <PageLoader label="Calculating your fare" />}
        {quote.isError && (
          <ErrorState
            message={
              quote.error instanceof ApiError && quote.error.status === 404
                ? 'There is no published fare for this vehicle type yet.'
                : errorMessage(quote.error)
            }
            onRetry={() => quote.refetch()}
          />
        )}
        {quote.data && route.data && (
          <FareQuoteCard
            quote={quote.data}
            estimated={route.data.estimated}
            durationMin={route.data.durationMin}
            onSave={onSave}
            saving={save.isPending}
            saved={savedKey === tripKey}
          />
        )}
        {savedKey === tripKey && (
          <p className="text-sm text-ink-soft">
            See it in{' '}
            <Link href="/trips" className="font-semibold text-jeep-blue underline underline-offset-2">
              your trip history
            </Link>
            .
          </p>
        )}
      </div>

      <TripMapLoader origin={origin} destination={destination} geometry={route.data?.geometry ?? null} />
    </div>
  );
}
