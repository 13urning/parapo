'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, PageLoader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useSession } from '@/providers/session-provider';
import { Brand } from './Brand';

const COMMUTER_NAV = [
  { href: '/plan', label: 'Plan trip' },
  { href: '/trips', label: 'My trips' },
  { href: '/fares', label: 'Fares' },
];
const ADMIN_NAV = [
  { href: '/admin/fare-matrices', label: 'Fare matrices' },
  { href: '/admin/analytics', label: 'Analytics' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-jeep-blue',
        active ? 'bg-ink text-white' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading, isUnauthenticated, logout } = useSession();
  const router = useRouter();

  // A stale cookie passes middleware but the API says 401: clear it, then go to /login.
  useEffect(() => {
    if (isUnauthenticated) {
      void logout()
        .catch(() => undefined)
        .finally(() => router.replace('/login'));
    }
  }, [isUnauthenticated, logout, router]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    router.replace('/login');
    router.refresh();
  };

  if (isLoading || !user) return <PageLoader label="Loading your account" />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-paper-line bg-white/95 backdrop-blur">
        <div className="livery-stripe h-1.5" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(to right,#ffc20e 0 50%,#c8102e 50% 75%,#1d4e89 75% 100%)' }} />
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <Brand />
          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
            {COMMUTER_NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
            {user.role === 'ADMIN' && (
              <>
                <span className="mx-2 h-5 w-px bg-paper-line" aria-hidden="true" />
                {ADMIN_NAV.map((n) => (
                  <NavLink key={n.href} {...n} />
                ))}
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <NotificationBell />
            <span className="hidden max-w-[10rem] truncate text-sm text-ink-soft lg:inline" title={user.email}>
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Main (mobile)" className="flex gap-1 overflow-x-auto border-t border-paper-line px-3 py-1.5 md:hidden">
          {COMMUTER_NAV.map((n) => (
            <NavLink key={n.href} {...n} />
          ))}
          {user.role === 'ADMIN' && ADMIN_NAV.map((n) => <NavLink key={n.href} {...n} />)}
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
