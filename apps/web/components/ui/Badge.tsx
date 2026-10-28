import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'yellow' | 'red' | 'blue' | 'green';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-ink-soft ring-stone-300',
  yellow: 'bg-jeep-yellow-soft text-[#6B4F00] ring-jeep-yellow-dark/50',
  red: 'bg-jeep-red-soft text-jeep-red-dark ring-jeep-red/30',
  blue: 'bg-jeep-blue-soft text-jeep-blue-dark ring-jeep-blue/30',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-600/30',
};

export function Badge({
  tone = 'neutral',
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}
      {...rest}
    />
  );
}
