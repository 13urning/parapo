'use client';

import { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, ConfirmDialog, EmptyState, PageLoader, Pagination, StatCard } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { tripsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { Trip } from '@/lib/api/types';
import { CATEGORY_LABELS, VEHICLE_LABELS, formatDate, formatKm, formatPeso } from '@/lib/format';

export const TRIPS_PAGE_SIZE = 10;

export function TripHistory() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Trip | null>(null);

  const trips = useQuery({
    queryKey: queryKeys.trips.list(page, TRIPS_PAGE_SIZE),
    queryFn: () => tripsApi.list(page, TRIPS_PAGE_SIZE),
    placeholderData: keepPreviousData,
  });
  const summary = useQuery({ queryKey: queryKeys.trips.summary, queryFn: tripsApi.summary });

  const remove = useMutation({
    mutationFn: (id: string) => tripsApi.remove(id),
    onSuccess: () => {
      // Deleting the last row of a later page should step back rather than show an empty page.
      if (trips.data && trips.data.items.length === 1 && page > 1) setPage(page - 1);
      void qc.invalidateQueries({ queryKey: queryKeys.trips.all });
      toast.success('Trip deleted.');
      setPending(null);
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Could not delete the trip.'));
      setPending(null);
    },
  });

  return (
    <div className="space-y-6">
      <section aria-label="This month" className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Spent this month"
          tone="yellow"
          value={summary.data ? formatPeso(summary.data.monthTotal) : '–'}
        />
        <StatCard label="Trips this month" tone="red" value={summary.data?.monthTrips ?? '–'} />
        <StatCard label="All-time trips" tone="blue" value={summary.data?.allTimeTrips ?? '–'} />
      </section>

      {trips.isPending && <PageLoader label="Loading your trips" />}
      {trips.isError && <ErrorState message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />}

      {trips.data && trips.data.total === 0 && (
        <EmptyState
          title="No trips yet"
          description="Plan a trip and save it to start your commute log."
          action={
            <Link
              href="/plan"
              className="inline-flex min-h-11 items-center rounded-lg bg-jeep-yellow px-4 font-semibold text-ink shadow-[0_2px_0_0_rgba(20,23,31,0.9)]"
            >
              Plan a trip
            </Link>
          }
        />
      )}

      {trips.data && trips.data.total > 0 && (
        <>
          <ul className="divide-y divide-paper-line overflow-hidden rounded-xl border border-paper-line bg-white shadow-card" aria-label="Trips">
            {trips.data.items.map((t) => (
              <li key={t.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {t.originLabel} <span aria-hidden="true">→</span>
                    <span className="sr-only">to</span> {t.destLabel}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
                    <span>{formatDate(t.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span aria-hidden="true">·</span>
                    <span>{VEHICLE_LABELS[t.vehicleType]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatKm(t.distanceKm)}</span>
                    {t.estimated && <Badge tone="yellow">Estimated</Badge>}
                    {t.fareCategory !== 'REGULAR' && <Badge tone="blue">{CATEGORY_LABELS[t.fareCategory]}</Badge>}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="font-display text-xl font-extrabold">{formatPeso(t.fare)}</p>
                  <Button variant="ghost" size="sm" onClick={() => setPending(t)} aria-label={`Delete trip to ${t.destLabel}`}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            page={trips.data.page}
            pageSize={trips.data.pageSize}
            total={trips.data.total}
            onPageChange={setPage}
            disabled={trips.isFetching}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        title="Delete this trip?"
        description={
          pending ? (
            <>
              {pending.originLabel} to {pending.destLabel} ({formatPeso(pending.fare)}) will be removed from your log.
              This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete trip"
        loading={remove.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && remove.mutate(pending.id)}
      />
    </div>
  );
}
