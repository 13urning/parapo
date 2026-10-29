import type { ReactNode } from 'react';
import { Page } from '@/components/ui';
import { AdminGuard } from '@/features/admin/AdminGuard';
import { AdminNav } from '@/features/admin/AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <Page wide>
        <AdminNav />
        {children}
      </Page>
    </AdminGuard>
  );
}
