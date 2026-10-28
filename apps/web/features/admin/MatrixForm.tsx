'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Select } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { matricesApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';
import type { FareMatrix } from '@/lib/api/types';
import { VEHICLE_LABELS, VEHICLE_TYPES } from '@/lib/format';
import { matrixSchema, type MatrixValues } from './matrix-schema';

const vehicleOptions = VEHICLE_TYPES.map((v) => ({ value: v, label: VEHICLE_LABELS[v] }));

const toDateInput = (iso: string) => iso.slice(0, 10);

export function MatrixForm({ matrix }: { matrix?: FareMatrix }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const editing = !!matrix;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatrixValues>({
    resolver: zodResolver(matrixSchema),
    defaultValues: matrix
      ? {
          vehicleType: matrix.vehicleType,
          baseFare: matrix.baseFare,
          baseKm: matrix.baseKm,
          perKmRate: matrix.perKmRate,
          discountPercent: matrix.discountPercent,
          effectiveDate: toDateInput(matrix.effectiveDate),
          notes: matrix.notes ?? '',
        }
      : { vehicleType: 'TRADITIONAL_JEEPNEY', discountPercent: 20, notes: '' },
  });

  const save = useMutation({
    mutationFn: (values: MatrixValues) => {
      const body = { ...values, notes: values.notes?.trim() || undefined };
      return matrix ? matricesApi.update(matrix.id, body) : matricesApi.create(body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.matrices.all });
      toast.success(editing ? 'Draft updated.' : 'Draft created.');
      router.push('/admin/fare-matrices');
    },
    onError: (err) => setServerError(errorMessage(err, 'Could not save the draft.')),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    save.mutate(values);
  });

  return (
    <Card accent="yellow" title={editing ? 'Edit draft' : 'New draft'} description="Drafts are invisible to commuters until published.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg border border-jeep-red/30 bg-jeep-red-soft px-3 py-2 text-sm font-medium text-jeep-red-dark">
            {serverError}
          </p>
        )}
        <Select label="Vehicle type" options={vehicleOptions} error={errors.vehicleType?.message} {...register('vehicleType')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Base fare (PHP)" type="number" step="0.05" inputMode="decimal" hint="1 to 200" error={errors.baseFare?.message} {...register('baseFare', { valueAsNumber: true })} />
          <Input label="Base distance (km)" type="number" step="1" inputMode="numeric" hint="Kilometres covered by the base fare, 1 to 20" error={errors.baseKm?.message} {...register('baseKm', { valueAsNumber: true })} />
          <Input label="Per-km rate (PHP)" type="number" step="0.05" inputMode="decimal" hint="Charged per additional km, 0 to 50" error={errors.perKmRate?.message} {...register('perKmRate', { valueAsNumber: true })} />
          <Input label="Discount (%)" type="number" step="1" inputMode="numeric" hint="Student, senior and PWD, 0 to 100" error={errors.discountPercent?.message} {...register('discountPercent', { valueAsNumber: true })} />
        </div>
        <Input label="Effective date" type="date" error={errors.effectiveDate?.message} {...register('effectiveDate')} />
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-sm font-semibold">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className="block w-full rounded-lg border border-stone-400 bg-white px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue"
            {...register('notes')}
          />
          {errors.notes && <p role="alert" className="text-sm font-medium text-jeep-red-dark">{errors.notes.message}</p>}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" loading={save.isPending}>
            {editing ? 'Save changes' : 'Create draft'}
          </Button>
          <Link
            href="/admin/fare-matrices"
            className="inline-flex min-h-11 items-center rounded-lg border border-paper-line px-4 text-sm font-semibold hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
