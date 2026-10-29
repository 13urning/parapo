'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { VehicleIcon } from '@/components/icons';
import { Button, ConfirmDialog, PageLoader, buttonClass } from '@/components/ui';
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
      // Publishing creates a notification for every user, so refresh the bell and list too.
      if (kind === 'publish') void qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
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
    <div className="space-y-8">
      {VEHICLE_TYPES.map((vt) => {
        const items = data.filter((m) => m.vehicleType === vt);
        return (
          <section key={vt} aria-label={VEHICLE_LABELS[vt]}>
            <h2 className="flex items-center gap-2.5 border-b border-line pb-2 text-lg font-extrabold text-ink">
              <VehicleIcon type={vt} size={28} className="text-ink-soft" />
              {VEHICLE_LABELS[vt]}
            </h2>
            {items.length === 0 ? (
              <p className="py-5 text-[15px] text-ink-soft">No matrices yet. Create a draft to get started.</p>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((m) => (
                  <li key={m.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-base font-bold text-ink">
                        {formatPeso(m.baseFare)} first {m.baseKm} km + {formatPeso(m.perKmRate)}/km
                      </p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {m.discountPercent}% discount &middot; effective <span className="whitespace-nowrap">{formatDate(m.effectiveDate)}</span>
                      {m.publishedAt && <> &middot; published <span className="whitespace-nowrap">{formatDate(m.publishedAt)}</span></>}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link href={`/admin/fare-matrices/${m.id}`} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                        {m.status === 'DRAFT' ? 'Edit' : 'View'}
                      </Link>
                      {m.status === 'DRAFT' && (
                        <>
                          <Button size="sm" onClick={() => setAction({ kind: 'publish', matrix: m })}>
                            Publish
                          </Button>
                          {/* Destructive action sits apart from Publish, far edge, quiet until pressed. */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto text-danger"
                            onClick={() => setAction({ kind: 'delete', matrix: m })}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
