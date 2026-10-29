'use client';

import Link from 'next/link';
import { BellIcon } from '@/components/icons';
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
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-ink" aria-live="polite">
          {data.unread > 0 ? `${data.unread} unread` : 'All caught up'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-3.5 text-brand"
          disabled={data.unread === 0}
          loading={markAll.isPending}
          onClick={() => markAll.mutate(undefined, { onError })}
        >
          Mark all as read
        </Button>
      </div>

      {data.items.length === 0 ? (
        <EmptyState icon={<BellIcon size={28} />} title="No notifications yet" description="We will tell you here when fares change." />
      ) : (
        <ul className="mt-1">
          {data.items.map((n, i) => {
            const unread = !n.readAt;
            return (
              <li
                key={n.id}
                className={cn('animate-row-in -mx-3 flex gap-3 rounded-xl px-3 py-4', unread && 'bg-brand-50')}
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                {/* Unread is a dot plus bold plus a spoken "Unread", never colour alone. */}
                <span
                  className={cn('mt-2 h-2.5 w-2.5 shrink-0 rounded-full', unread ? 'bg-brand' : 'bg-transparent')}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <h3 className={cn('text-base leading-snug text-ink', unread ? 'font-extrabold' : 'font-semibold')}>
                    {unread && <span className="sr-only">Unread: </span>}
                    {n.title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-snug text-ink-soft">{n.body}</p>
                  <p className="mt-1.5 text-[13px] text-ink-soft">
                    {formatDate(n.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <div className="-ml-3 mt-1 flex flex-wrap items-center">
                    {n.url.startsWith('/') && (
                      <Link
                        href={n.url}
                        className="press inline-flex min-h-11 items-center px-3 text-[15px] font-bold text-brand underline underline-offset-2"
                      >
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
