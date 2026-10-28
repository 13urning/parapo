'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui';
import { useSession } from '@/providers/session-provider';

/** Second line of UX defence behind middleware: the API still enforces 403 itself. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const router = useRouter();
  const allowed = user?.role === 'ADMIN';

  useEffect(() => {
    if (user && !allowed) router.replace('/plan');
  }, [user, allowed, router]);

  return allowed ? <>{children}</> : <PageLoader />;
}
