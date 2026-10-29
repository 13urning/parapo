import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 mt-2 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-ink-soft">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
