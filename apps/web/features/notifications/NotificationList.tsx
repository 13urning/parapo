'use client';

import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { Button, EmptyState, PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useMarkAllRead, useMarkRead, useNotifications } from './hooks';

export function NotificationList() {
  const { data, isPending, error, refetch } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  if (isPending) return <PageLoader label="Loading notifications" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;

  const onError = (err: unknown) => toast.error(errorMessage(err));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {data.unread > 0 ? `${data.unread} unread` : 'All caught up'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={data.unread === 0}
          loading={markAll.isPending}
          onClick={() => markAll.mutate(undefined, { onError })}
        >
          Mark all as read
        </Button>
      </div>

      {data.items.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" description="We will tell you here when fares change." />
      ) : (
        <ul className="space-y-3">
          {data.items.map((n) => {
            const unread = !n.readAt;
            return (
              <li
                key={n.id}
                className={cn(
                  'rounded-xl border p-4',
                  unread ? 'border-jeep-yellow-dark/60 border-l-4 border-l-jeep-yellow bg-jeep-yellow-soft' : 'border-paper-line bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={cn('text-base text-ink', unread ? 'font-bold' : 'font-medium')}>
                      {unread && <span className="sr-only">Unread: </span>}
                      {n.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">{n.body}</p>
                    <p className="mt-2 text-xs text-ink-faint">{formatDate(n.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {n.url.startsWith('/') && (
                      <Link href={n.url} className="text-sm font-semibold text-jeep-blue underline underline-offset-2">
                        View
                      </Link>
                    )}
                    {unread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Mark "${n.title}" as read`}
                        onClick={() => markRead.mutate(n.id, { onError })}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
