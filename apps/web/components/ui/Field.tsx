import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const controlClass = (invalid?: boolean) =>
  cn(
    'block w-full min-h-11 rounded-lg border bg-white px-3 py-2 text-base text-ink placeholder:text-ink-faint',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-jeep-blue',
    'disabled:bg-paper disabled:text-ink-faint',
    invalid ? 'border-jeep-red' : 'border-stone-400',
  );

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Shared label + hint + error wrapper for form controls. */
export function Field({ id, label, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-jeep-red-dark">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
