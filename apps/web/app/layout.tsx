import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/providers';
import { PageViewTracker } from '@/features/analytics/PageViewTracker';

export const metadata: Metadata = {
  title: { default: 'ParaPo! Jeepney fare calculator', template: '%s | ParaPo!' },
  description: 'Plan your jeepney trip, know your fare, and keep a log of your commute.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#FFC20E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
