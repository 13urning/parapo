'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, StickyAction } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { usePublishedMatrices } from '@/features/fares/hooks';
import { useMediaQuery } from '@/hooks/use-media-query';
import { placesApi, tripsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { Place, VehicleType } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { CATEGORY_LABELS, formatPeso } from '@/lib/format';
import { cheapestVehicle, resolveSelected } from '@/lib/quotes';
import { FareWorking } from './FareWorking';
import { PlaceCombobox } from './PlaceCombobox';
import { RideList } from './RideList';
import { RouteStrip } from './RouteStrip';
import { TripMapLoader } from './TripMapLoader';
import { useVehicleQuotes } from './use-vehicle-quotes';

export function PlanTrip() {
  const qc = useQueryClient();
  const isLaptop = useMediaQuery('(min-width: 1024px)');
  const mapId = useId();
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [picked, setPicked] = useState<VehicleType | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  // Tiles are only requested once the rider asks for the map (kind to slow mobile data).
  const [mapEverOpened, setMapEverOpened] = useState(false);

  const from: [number, number] | null = origin ? [origin.lat, origin.lng] : null;
  const to: [number, number] | null = destination ? [destination.lat, destination.lng] : null;

  const ready = !!origin && !!destination;
  const sameSpot = ready && origin.lat === destination.lat && origin.lng === destination.lng;

  const route = useQuery({
    queryKey: queryKeys.places.route(from, to),
    queryFn: ({ signal }) => placesApi.route(from!, to!, signal),
    enabled: !!from && !!to && !sameSpot,
    staleTime: 10 * 60_000,
  });

  const distanceKm = sameSpot ? undefined : route.data?.distanceKm;
  const hasDistance = distanceKm !== undefined && distanceKm > 0;
  const { items, retry } = useVehicleQuotes(distanceKm);
  const matrices = usePublishedMatrices(hasDistance);

  const cheapest = cheapestVehicle(items);
  const selected = resolveSelected(picked, items);
  const selectedQuote = items.find((i) => i.vehicleType === selected)?.quote;
  const selectedMatrix = selectedQuote ? matrices.data?.find((m) => m.id === selectedQuote.matrixId) : undefined;

  const tripKey = `${origin?.label}|${destination?.label}|${selected}|${distanceKm}`;
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
    if (!origin || !destination || !route.data || !selected) return;
    save.mutate({
      originLabel: origin.label,
      originLat: origin.lat,
      originLng: origin.lng,
      destLabel: destination.label,
      destLat: destination.lat,
      destLng: destination.lng,
      vehicleType: selected,
      distanceKm: route.data.distanceKm,
      estimated: route.data.estimated,
    });
  };

  const saved = savedKey === tripKey;
  const routing = ready && !sameSpot && route.isPending;
  const showRides = !!route.data && !sameSpot && hasDistance;

  const toggleMap = () => {
    setMapOpen((o) => !o);
    setMapEverOpened(true);
  };

  const discountNote = selectedQuote ? (
    selectedQuote.discountApplied ? (
      <>
        {CATEGORY_LABELS[selectedQuote.fareCategory]}{' '}
        {selectedMatrix ? <b className="font-extrabold text-brand">−{selectedMatrix.discountPercent}%</b> : <b className="font-extrabold text-brand">discount applied</b>}
      </>
    ) : (
      <>{CATEGORY_LABELS[selectedQuote.fareCategory]} fare</>
    )
  ) : null;

  return (
    <div className="lg:grid lg:grid-cols-[440px_minmax(0,1fr)]">
      <section
        aria-label="Plan your trip"
        className="flex min-h-[calc(100dvh-var(--head-h)-var(--nav-h))] flex-col lg:sticky lg:top-0 lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-line"
      >
        <div className="px-5 pt-1 lg:px-6 lg:pt-8">
          <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-ink">Where to?</h1>

          {/* From / To stack, joined by a dotted connector. */}
          <div className="relative mt-3.5 rounded-[14px] bg-surface py-1 pl-10 pr-2">
            <span className="pointer-events-none absolute z-10 left-4 top-[22px] h-2.5 w-2.5 rounded-full border-[2.5px] border-brand bg-white" aria-hidden="true" />
            <span className="pointer-events-none absolute z-10 left-5 top-[34px] h-8 border-l-2 border-dotted border-[#8A9099]" aria-hidden="true" />
            <span className="pointer-events-none absolute z-10 left-4 top-[69px] h-2.5 w-2.5 rounded-[2px] bg-ink" aria-hidden="true" />
            <PlaceCombobox label="From" placeholder="Where are you?" value={origin} onChange={setOrigin} />
            <div className="border-t border-[#E0E3E1]">
              <PlaceCombobox label="To" placeholder="Where to?" value={destination} onChange={setDestination} />
            </div>
          </div>

          {/* Route strip. On a phone it opens the map; on a laptop the map is already beside it. */}
          {ready && !sameSpot && !route.isError && (
            <div className="mt-3">
              <RouteStrip
                geometry={route.data?.geometry ?? null}
                distanceKm={route.data?.distanceKm ?? null}
                estimated={route.data?.estimated}
                loading={routing}
                interactive={!isLaptop}
                expanded={mapOpen}
                onToggle={toggleMap}
                controlsId={mapId}
              />
              {route.data?.estimated && (
                <p className="mt-2 text-[13px] leading-snug text-ink-soft">
                  <span className="mr-1.5 inline-block rounded-md bg-surface px-2 py-0.5 text-xs font-extrabold text-ink">
                    Estimated distance
                  </span>
                  Road routing was unavailable, so this is a straight-line estimate. Your actual fare may differ slightly.
                </p>
              )}
              {!isLaptop && route.data && (
                <div
                  id={mapId}
                  inert={!mapOpen}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    mapOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    {mapEverOpened && (
                      <div className="mt-2 h-[280px] overflow-hidden rounded-[14px]">
                        <TripMapLoader origin={origin} destination={destination} geometry={route.data.geometry} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {sameSpot && (
            <div className="mt-3">
              <ErrorState message="Pick two different places to calculate a fare." />
            </div>
          )}
          {route.isError && (
            <div className="mt-3">
              <ErrorState message={errorMessage(route.error)} onRetry={() => route.refetch()} />
            </div>
          )}

          {!ready && (
            <p className="mt-8 text-[15px] leading-snug text-ink-soft">
              Pick where you are and where you are going. You will see what every ride costs, with your discount applied.
            </p>
          )}

          {showRides && (
            <div className="animate-rise mt-5">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-extrabold text-ink">Choose a ride</h2>
                {discountNote && <p className="text-[13px] font-semibold text-ink-soft">{discountNote}</p>}
              </div>
              <RideList items={items} selected={selected} cheapest={cheapest} onSelect={setPicked} onRetry={retry} />
              {selectedQuote && (
                <div className="mt-2">
                  <FareWorking quote={selectedQuote} matrix={selectedMatrix} estimated={!!route.data?.estimated} />
                </div>
              )}
            </div>
          )}
        </div>

        <StickyAction className="mt-auto">
          {saved && (
            <p className="mb-2 text-center text-sm text-ink-soft">
              See it in{' '}
              <Link href="/trips" className="inline-flex min-h-11 items-center font-bold text-brand underline underline-offset-2">
                your trip history
              </Link>
              .
            </p>
          )}
          <Button
            size="lg"
            variant={saved ? 'secondary' : 'primary'}
            className="w-full"
            onClick={onSave}
            loading={save.isPending}
            disabled={!selectedQuote || saved}
          >
            {saved ? 'Trip logged' : selectedQuote ? `Log this trip · ${formatPeso(selectedQuote.fare)}` : 'Log this trip'}
          </Button>
        </StickyAction>
      </section>

      {/* Laptop: the map fills the right side permanently. */}
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        {isLaptop && <TripMapLoader origin={origin} destination={destination} geometry={route.data?.geometry ?? null} />}
      </div>
    </div>
  );
}
