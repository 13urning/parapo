'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { NavItemInner, navItemClass } from '@/features/layout/NavItem';
import { useNotifications } from './hooks';

/**
 * The Alerts entry in the main navigation. Its accessible name carries the unread count; the visible
 * badge sits on the bell so a new fare update is noticed from any screen.
 */
export function NotificationBell({ className, label = 'Alerts' }: { className?: string; label?: string }) {
  const { data } = useNotifications();
  const pathname = usePathname() ?? '';
  const unread = data?.unread ?? 0;
  const active = pathname === '/notifications' || pathname.startsWith('/notifications/');
  return (
    <Link
      href="/notifications"
      aria-current={active ? 'page' : undefined}
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      className={cn(navItemClass(active), className)}
    >
      <NavItemInner
        active={active}
        label={label}
        icon={
          <>
            <BellIcon />
            {unread > 0 && (
              <span
                data-testid="unread-badge"
                className="absolute -right-0.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-white"
                aria-hidden="true"
              >
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </>
        }
      />
    </Link>
  );
}
