'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { SessionProvider } from './session-provider';
import { Toaster } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </QueryProvider>
  );
}
