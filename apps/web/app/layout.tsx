import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import './globals.css';
import { Providers } from '@/providers';
import { PageViewTracker } from '@/features/analytics/PageViewTracker';

export const metadata: Metadata = {
  title: { default: 'ParaPo! Jeepney fare calculator', template: '%s | ParaPo!' },
  description: 'Plan your jeepney trip, know your fare, and keep a log of your commute.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#FFC20E', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Middleware issues a per-request CSP nonce. Reading request headers opts the tree into dynamic
  // rendering, which is required for Next to stamp that nonce onto its framework scripts.
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" data-nonce={nonce ? 'set' : undefined}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Providers>
          <PageViewTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
