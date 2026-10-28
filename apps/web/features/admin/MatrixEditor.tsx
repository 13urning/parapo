'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, PageLoader } from '@/components/ui';
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
    return (
      <Card title={VEHICLE_LABELS[data.vehicleType]} actions={<StatusBadge status={data.status} />}>
        <p className="text-sm text-ink-soft">Only drafts can be edited. Create a new draft to change these values.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-ink-soft">Base fare</dt><dd className="font-semibold">{formatPeso(data.baseFare)} for {data.baseKm} km</dd></div>
          <div><dt className="text-ink-soft">Per-km rate</dt><dd className="font-semibold">{formatPeso(data.perKmRate)}</dd></div>
          <div><dt className="text-ink-soft">Discount</dt><dd className="font-semibold">{data.discountPercent}%</dd></div>
          <div><dt className="text-ink-soft">Effective</dt><dd className="font-semibold">{formatDate(data.effectiveDate)}</dd></div>
          {data.notes && <div className="col-span-2"><dt className="text-ink-soft">Notes</dt><dd>{data.notes}</dd></div>}
        </dl>
      </Card>
    );
  }
  return <MatrixForm matrix={data} />;
}
