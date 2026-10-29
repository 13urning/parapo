import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface text-ink-soft" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-[15px] text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-[14px] bg-danger-50 p-4 text-[15px] text-danger">
      <p className="font-bold">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="press -mb-2 mt-1 min-h-11 font-bold underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}
