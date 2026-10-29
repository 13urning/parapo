import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const controlClass = (invalid?: boolean) =>
  cn(
    'block w-full min-h-12 rounded-[14px] border-2 bg-surface px-4 py-2.5 text-base font-semibold text-ink placeholder:font-medium',
    'transition-colors focus:bg-white focus-visible:outline-none focus-visible:border-brand',
    'disabled:text-ink-faint',
    invalid ? 'border-danger bg-danger-50' : 'border-transparent',
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
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
