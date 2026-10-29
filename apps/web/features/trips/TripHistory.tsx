'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HistoryIcon, TrashIcon, VehicleIcon } from '@/components/icons';
import { Button, ConfirmDialog, EmptyState, Modal, PageLoader, Pagination, Tag, buttonClass } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { tripsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { Trip } from '@/lib/api/types';
import { CATEGORY_LABELS, VEHICLE_LABELS, dayKey, formatDate, formatDayHeading, formatKm, formatPeso } from '@/lib/format';
import { shortPlaceLabel } from '@/lib/place-label';

export const TRIPS_PAGE_SIZE = 10;

function groupByDay(trips: Trip[]) {
  const groups: { key: string; heading: string; trips: Trip[] }[] = [];
  for (const t of trips) {
    const key = dayKey(t.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.trips.push(t);
    else groups.push({ key, heading: formatDayHeading(t.createdAt), trips: [t] });
  }
  return groups;
}

export function TripHistory() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Trip | null>(null);
  const [detail, setDetail] = useState<Trip | null>(null);

  const trips = useQuery({
    queryKey: queryKeys.trips.list(page, TRIPS_PAGE_SIZE),
    queryFn: () => tripsApi.list(page, TRIPS_PAGE_SIZE),
    placeholderData: keepPreviousData,
  });
  // If the refetched total no longer reaches this page (e.g. the last row was deleted), step back.
  const total = trips.isPlaceholderData ? undefined : trips.data?.total;
  useEffect(() => {
    if (total === undefined) return;
    const lastPage = Math.max(1, Math.ceil(total / TRIPS_PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
  }, [total, page]);

  const summary = useQuery({ queryKey: queryKeys.trips.summary, queryFn: tripsApi.summary });

  const remove = useMutation({
    mutationFn: (id: string) => tripsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.trips.all });
      toast.success('Trip deleted.');
      setPending(null);
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Could not delete the trip.'));
      setPending(null);
    },
  });

  const groups = useMemo(() => groupByDay(trips.data?.items ?? []), [trips.data]);
  let rowIndex = 0;

  return (
    <div className="space-y-6">
      {/* The month, as one plain number. */}
      <section aria-label="This month">
        <p className="text-sm font-semibold text-ink-soft">Spent this month</p>
        <p className="mt-1 text-[44px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          {summary.data ? formatPeso(summary.data.monthTotal) : '–'}
        </p>
        {summary.data && (
          <p className="mt-2 text-[15px] text-ink-soft">
            <span>{summary.data.monthTrips}</span> {summary.data.monthTrips === 1 ? 'trip' : 'trips'} this month ·{' '}
            <span>{summary.data.allTimeTrips}</span> logged in all
          </p>
        )}
      </section>

      {trips.isPending && <PageLoader label="Loading your trips" />}
      {trips.isError && <ErrorState message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />}

      {trips.data && trips.data.total === 0 && (
        <EmptyState
          icon={<HistoryIcon size={28} />}
          title="No trips yet"
          description="Plan a trip and save it to start your commute log."
          action={
            <Link href="/plan" className={buttonClass()}>
              Plan a trip
            </Link>
          }
        />
      )}

      {trips.data && trips.data.total > 0 && (
        <>
          <div aria-label="Trips">
            {groups.map((g) => (
              <section key={g.key} aria-label={g.heading} className="mb-2">
                <h2 className="border-b border-line pb-2 pt-4 text-[13px] font-extrabold text-ink-soft">{g.heading}</h2>
                <ul className="divide-y divide-line">
                  {g.trips.map((t) => (
                    <li
                      key={t.id}
                      className="animate-row-in"
                      style={{ animationDelay: `${Math.min(rowIndex++, 12) * 30}ms` }}
                    >
                      {/* The whole row opens the trip's detail sheet; delete lives there, away from the fare. */}
                      <button
                        type="button"
                        onClick={() => setDetail(t)}
                        aria-label={`Trip to ${t.destLabel}, ${formatPeso(t.fare)}. Open details`}
                        className="press flex w-full items-center gap-3 py-3 text-left"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-ink" title={VEHICLE_LABELS[t.vehicleType]}>
                          <VehicleIcon type={t.vehicleType} size={26} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-ink">
                            {shortPlaceLabel(t.originLabel)} <span aria-hidden="true">→</span>
                            <span className="sr-only">to</span> {shortPlaceLabel(t.destLabel)}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-soft">
                            <span>{formatDate(t.createdAt, { timeStyle: 'short' })}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatKm(t.distanceKm)}</span>
                            {t.estimated && <Tag className="hidden lg:inline-flex">Estimated</Tag>}
                            {t.fareCategory !== 'REGULAR' && <Tag tone="green">{CATEGORY_LABELS[t.fareCategory]}</Tag>}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-xl font-extrabold tracking-[-0.01em] text-ink">{formatPeso(t.fare)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {trips.data.total > trips.data.pageSize && (
            <Pagination
              page={trips.data.page}
              pageSize={trips.data.pageSize}
              total={trips.data.total}
              onPageChange={setPage}
              disabled={trips.isFetching}
            />
          )}
        </>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Trip details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Close
            </Button>
            {/* Isolated at the bottom: it only leads to the confirm step. */}
            <Button
              variant="ghost"
              className="text-danger"
              onClick={() => {
                setPending(detail);
                setDetail(null);
              }}
            >
              <TrashIcon size={18} /> Delete trip
            </Button>
          </>
        }
      >
        {detail && (
          <>
            <p className="text-[28px] font-extrabold leading-none tracking-[-0.02em] text-ink">{formatPeso(detail.fare)}</p>
            <dl className="mt-4 divide-y divide-line border-y border-line text-[15px]">
              {(
                [
                  ['From', detail.originLabel],
                  ['To', detail.destLabel],
                  ['Vehicle', VEHICLE_LABELS[detail.vehicleType]],
                  ['Fare category', CATEGORY_LABELS[detail.fareCategory]],
                  ['Distance', formatKm(detail.distanceKm)],
                  ['When', formatDate(detail.createdAt, { dateStyle: 'medium', timeStyle: 'short' })],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-5 py-2.5">
                  <dt className="shrink-0 text-ink-soft">{k}</dt>
                  <dd className="text-right font-semibold text-ink">
                    {v}
                    {k === 'Distance' && detail.estimated && <Tag className="ml-2 align-middle">Estimated</Tag>}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </Modal>

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
