import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Colored top rule, echoing a jeepney side stripe. */
  accent?: 'yellow' | 'red' | 'blue' | 'none';
}

const accents = {
  yellow: 'border-t-jeep-yellow',
  red: 'border-t-jeep-red',
  blue: 'border-t-jeep-blue',
  none: 'border-t-paper-line',
};

export function Card({ title, description, actions, accent = 'none', className, children, ...rest }: CardProps) {
  return (
    <section
      className={cn('rounded-xl border border-paper-line border-t-4 bg-paper-card p-4 shadow-card sm:p-6', accents[accent], className)}
      {...rest}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
