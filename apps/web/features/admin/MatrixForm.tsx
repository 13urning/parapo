'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Select, Textarea, buttonClass } from '@/components/ui';
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
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError && (
        <p role="alert" className="rounded-[14px] bg-danger-50 px-4 py-3 text-sm font-semibold text-danger">
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
      <Textarea id="notes" label="Notes (optional)" rows={3} error={errors.notes?.message} {...register('notes')} />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Link href="/admin/fare-matrices" className={buttonClass({ variant: 'secondary' })}>
          Cancel
        </Link>
        <Button type="submit" loading={save.isPending}>
          {editing ? 'Save changes' : 'Create draft'}
        </Button>
      </div>
    </form>
  );
}
