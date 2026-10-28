import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'yellow' | 'red' | 'blue';
}

const bars = { yellow: 'bg-jeep-yellow', red: 'bg-jeep-red', blue: 'bg-jeep-blue' };

export function StatCard({ label, value, hint, tone = 'yellow' }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-paper-line bg-white p-4 shadow-card">
      <span className={cn('absolute inset-y-0 left-0 w-1.5', bars[tone])} aria-hidden="true" />
      <dl className="pl-2">
        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</dt>
        <dd className="mt-1 font-display text-3xl font-extrabold text-ink">{value}</dd>
        {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
      </dl>
    </div>
  );
}
