import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, pageSize, total, onPageChange, disabled }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-soft" aria-live="polite">
        Showing {from}-{to} of {total} &middot; Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
          Next
        </Button>
      </div>
    </nav>
  );
}
