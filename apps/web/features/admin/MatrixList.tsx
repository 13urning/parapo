'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, ConfirmDialog, EmptyState, PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { matricesApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { FareMatrix } from '@/lib/api/types';
import { VEHICLE_LABELS, VEHICLE_TYPES, formatDate, formatPeso } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

type Action = { kind: 'publish' | 'delete'; matrix: FareMatrix } | null;

export function MatrixList() {
  const qc = useQueryClient();
  const [action, setAction] = useState<Action>(null);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.matrices.list(),
    queryFn: () => matricesApi.list(),
  });

  const run = useMutation({
    mutationFn: async (a: NonNullable<Action>) => {
      if (a.kind === 'publish') await matricesApi.publish(a.matrix.id);
      else await matricesApi.remove(a.matrix.id);
      return a.kind;
    },
    onSuccess: (kind) => {
      void qc.invalidateQueries({ queryKey: queryKeys.matrices.all });
      toast.success(kind === 'publish' ? 'Fare matrix published. All users were notified.' : 'Draft deleted.');
      setAction(null);
    },
    onError: (err) => {
      toast.error(errorMessage(err));
      setAction(null);
    },
  });

  if (isPending) return <PageLoader label="Loading fare matrices" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {VEHICLE_TYPES.map((vt) => {
        const items = data.filter((m) => m.vehicleType === vt);
        return (
          <Card key={vt} title={VEHICLE_LABELS[vt]} accent="blue" aria-label={VEHICLE_LABELS[vt]}>
            {items.length === 0 ? (
              <EmptyState icon="📋" title="No matrices yet" description="Create a draft to get started." />
            ) : (
              <ul className="divide-y divide-paper-line">
                {items.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        <StatusBadge status={m.status} />
                        <span>
                          {formatPeso(m.baseFare)} first {m.baseKm} km + {formatPeso(m.perKmRate)}/km
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {m.discountPercent}% discount &middot; effective {formatDate(m.effectiveDate)}
                        {m.publishedAt && <> &middot; published {formatDate(m.publishedAt)}</>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/fare-matrices/${m.id}`}
                        className="inline-flex min-h-9 items-center rounded-lg border border-paper-line px-3 text-sm font-semibold hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue"
                      >
                        {m.status === 'DRAFT' ? 'Edit' : 'View'}
                      </Link>
                      {m.status === 'DRAFT' && (
                        <>
                          <Button size="sm" onClick={() => setAction({ kind: 'publish', matrix: m })}>
                            Publish
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setAction({ kind: 'delete', matrix: m })}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}

      <ConfirmDialog
        open={action?.kind === 'publish'}
        title="Publish this fare matrix?"
        variant="primary"
        confirmLabel="Publish and notify"
        loading={run.isPending}
        description={
          <>
            The current published matrix for {action ? VEHICLE_LABELS[action.matrix.vehicleType] : ''} will be archived
            and this one goes live immediately. <strong>Every user will receive an in-app notification and a push
            notification.</strong> This cannot be undone.
          </>
        }
        onCancel={() => setAction(null)}
        onConfirm={() => action && run.mutate(action)}
      />
      <ConfirmDialog
        open={action?.kind === 'delete'}
        title="Delete this draft?"
        confirmLabel="Delete draft"
        loading={run.isPending}
        description="The draft will be permanently removed. Published and archived matrices are never deleted."
        onCancel={() => setAction(null)}
        onConfirm={() => action && run.mutate(action)}
      />
    </div>
  );
}
