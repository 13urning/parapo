'use client';

import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { matricesApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import { VEHICLE_LABELS, formatDate, formatPeso } from '@/lib/format';
import { MatrixForm } from './MatrixForm';
import { StatusBadge } from './StatusBadge';

export function MatrixEditor({ id }: { id: string }) {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.matrices.detail(id),
    queryFn: () => matricesApi.get(id),
  });

  if (isPending) return <PageLoader label="Loading fare matrix" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;

  if (data.status !== 'DRAFT') {
    const rows: [string, string][] = [
      ['Base fare', `${formatPeso(data.baseFare)} for ${data.baseKm} km`],
      ['Per-km rate', formatPeso(data.perKmRate)],
      ['Discount', `${data.discountPercent}%`],
      ['Effective', formatDate(data.effectiveDate)],
    ];
    return (
      <section aria-label={VEHICLE_LABELS[data.vehicleType]}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-ink">{VEHICLE_LABELS[data.vehicleType]}</h2>
          <StatusBadge status={data.status} />
        </div>
        <p className="mt-1 text-[15px] text-ink-soft">Only drafts can be edited. Create a new draft to change these values.</p>
        <dl className="mt-4 divide-y divide-line border-y border-line text-[15px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="whitespace-nowrap text-right font-bold">{v}</dd>
            </div>
          ))}
          {data.notes && (
            <div className="py-3">
              <dt className="text-ink-soft">Notes</dt>
              <dd className="mt-1">{data.notes}</dd>
            </div>
          )}
        </dl>
      </section>
    );
  }
  return <MatrixForm matrix={data} />;
}
