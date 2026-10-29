import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TagTone = 'neutral' | 'amber' | 'green' | 'red';

const tones: Record<TagTone, string> = {
  neutral: 'bg-surface text-ink-soft',
  // Amber is only for "Cheapest" and live state.
  amber: 'bg-signal text-signal-ink',
  green: 'bg-brand-50 text-brand-dark',
  red: 'bg-danger-50 text-danger',
};

/** Small plain status tag. No ring, no pill gloss. */
export function Tag({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-extrabold leading-5', tones[tone], className)}
      {...rest}
    />
  );
}
