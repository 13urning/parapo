import type { ReactNode } from 'react';
import { AppShell } from '@/features/layout/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
