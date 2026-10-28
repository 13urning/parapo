import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-paper-line bg-white/60 px-6 py-12 text-center">
      <div className="mb-3 text-3xl" aria-hidden="true">
        {icon ?? '🚌'}
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-jeep-red/30 bg-jeep-red-soft p-4 text-sm text-jeep-red-dark">
      <p className="font-semibold">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue"
        >
          Try again
        </button>
      )}
    </div>
  );
}
