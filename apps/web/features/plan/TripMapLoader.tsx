'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';
import type { TripMapProps } from './TripMap';

const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-stone-100 text-ink-soft">
      <Spinner label="Loading map" />
    </div>
  ),
});

export function TripMapLoader(props: TripMapProps) {
  return (
    <div className="h-72 overflow-hidden rounded-xl border border-paper-line sm:h-96 lg:h-full lg:min-h-[28rem]">
      <TripMap {...props} />
    </div>
  );
}
