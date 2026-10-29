'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { TripMapProps } from './TripMap';

const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-ink-soft">
      <Spinner label="Loading map" />
    </div>
  ),
});

/** Sizing comes from the caller: a 300px panel on a phone, the whole right pane on a laptop. */
export function TripMapLoader({ className, ...props }: TripMapProps & { className?: string }) {
  return (
    <div className={cn('animate-fade-in h-full w-full overflow-hidden bg-mapbg', className)}>
      <TripMap {...props} />
    </div>
  );
}
