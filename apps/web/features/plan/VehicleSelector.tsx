'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import { VEHICLE_LABELS, VEHICLE_TYPES } from '@/lib/format';
import type { VehicleType } from '@/lib/api/types';

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (v: VehicleType) => void;
}

/** Radio group styled as big tappable cards. */
export function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">Vehicle type</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {VEHICLE_TYPES.map((v) => (
          <label
            key={v}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2 text-center text-sm font-semibold transition-colors',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-jeep-blue',
              value === v ? 'border-ink bg-jeep-yellow text-ink' : 'border-paper-line bg-white text-ink-soft hover:border-stone-400',
            )}
          >
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              className="sr-only"
            />
            {VEHICLE_LABELS[v]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
