'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Shown below the sm breakpoint so three options fit one line; the full label stays the accessible name. */
  shortLabel?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
}

/** Radio group drawn as a segmented control. Native radios, so arrow keys and screen readers just work. */
export function Segmented<T extends string>({ label, value, onChange, options }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex gap-1 rounded-[14px] bg-surface p-1">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'press relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-[11px] px-2 text-center text-[14px] font-bold leading-tight transition-colors',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
              value === o.value ? 'bg-white text-ink shadow-[0_1px_3px_rgba(21,24,28,0.14)]' : 'text-ink-soft',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.shortLabel ? (
              <>
                <span className="sr-only">{o.label}</span>
                <span aria-hidden="true" className="sm:hidden">{o.shortLabel}</span>
                <span aria-hidden="true" className="hidden sm:inline">{o.label}</span>
              </>
            ) : (
              o.label
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
