'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useNotifications } from './hooks';

export function NotificationBell({ className }: { className?: string }) {
  const { data } = useNotifications();
  const unread = data?.unread ?? 0;
  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-ink/5',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
      </svg>
      {unread > 0 && (
        <span
          data-testid="unread-badge"
          className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-jeep-red px-1 text-[11px] font-bold text-white ring-2 ring-white"
          aria-hidden="true"
        >
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
