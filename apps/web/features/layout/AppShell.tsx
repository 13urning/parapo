'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HistoryIcon, PesoIcon, RouteIcon, ShieldIcon, UserIcon } from '@/components/icons';
import { Button, Modal, PageLoader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { CATEGORY_LABELS } from '@/lib/format';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useSession } from '@/providers/session-provider';
import { Brand } from './Brand';
import { NavItemInner, navItemClass } from './NavItem';

const NAV = [
  { href: '/plan', label: 'Plan', icon: RouteIcon },
  { href: '/trips', label: 'Trips', icon: HistoryIcon },
  { href: '/fares', label: 'Fares', icon: PesoIcon },
];
// Admins get a fifth entry that opens the admin area; Matrices and Analytics are a switch inside it.
const ADMIN_NAV = { href: '/admin/fare-matrices', match: '/admin', label: 'Admin', icon: ShieldIcon };

function NavLink({ href, match = href, label, icon: Icon }: { href: string; match?: string; label: string; icon: typeof RouteIcon }) {
  const pathname = usePathname() ?? '';
  const active = pathname === match || pathname.startsWith(`${match}/`);
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={navItemClass(active)}>
      <NavItemInner active={active} label={label} icon={<Icon />} />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading, isUnauthenticated, logout } = useSession();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);

  // A stale cookie passes middleware but the API says 401. The cookie is httpOnly, so ask the
  // server to delete it; otherwise middleware would bounce /login straight back to /plan.
  useEffect(() => {
    if (!isUnauthenticated) return;
    void fetch('/api/session/clear', { method: 'POST', credentials: 'same-origin' })
      .catch(() => undefined)
      .finally(() => router.replace('/login?reason=expired'));
  }, [isUnauthenticated, router]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    setAccountOpen(false);
    router.replace('/login');
    router.refresh();
  };

  if (isLoading || !user) return <PageLoader label="Loading your account" />;

  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  const accountButton = (className: string) => (
    <button
      type="button"
      onClick={() => setAccountOpen(true)}
      aria-label={`Account: ${user.name}`}
      className={cn('press grid h-11 w-11 place-items-center rounded-full bg-surface text-[15px] font-extrabold text-ink', className)}
    >
      {initial}
    </button>
  );

  return (
    <div className="min-h-dvh lg:pl-24">
      {/* Phone top bar: wordmark and account. On a laptop the rail carries both. */}
      <header className="flex h-[var(--head-h)] items-center justify-between px-5 pt-[env(safe-area-inset-top)] lg:hidden">
        <Brand />
        {accountButton('-mr-1')}
      </header>

      {/* One navigation: a tab bar pinned to the bottom of a phone, a rail down the left of a laptop. */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex h-[var(--nav-h)] border-t border-line bg-white pb-[env(safe-area-inset-bottom)]',
          'lg:inset-y-0 lg:right-auto lg:h-auto lg:w-24 lg:flex-col lg:items-stretch lg:border-r lg:border-t-0 lg:px-2 lg:pb-4 lg:pt-4',
        )}
      >
        <div className="hidden justify-center pb-4 lg:flex">
          <Brand />
        </div>
        <nav aria-label="Main" className="flex flex-1 lg:flex-none lg:flex-col lg:gap-1">
          {NAV.map((n) => (
            <NavLink key={n.href} {...n} />
          ))}
          <NotificationBell />
          {user.role === 'ADMIN' && <NavLink {...ADMIN_NAV} />}
        </nav>
        <div className="mt-auto hidden justify-center lg:flex">{accountButton('')}</div>
      </div>

      <main id="main" className="min-h-[calc(100dvh-var(--head-h))] pb-[var(--nav-h)]">
        {children}
      </main>

      <Modal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title="Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAccountOpen(false)}>
              Close
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-ink" aria-hidden="true">
            <UserIcon />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{user.name}</p>
            <p className="truncate text-sm">{user.email}</p>
            <p className="text-sm">
              {CATEGORY_LABELS[user.fareCategory]} fare{user.role === 'ADMIN' ? ' · Administrator' : ''}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
