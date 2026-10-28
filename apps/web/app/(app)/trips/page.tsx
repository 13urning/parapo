import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { TripHistory } from '@/features/trips/TripHistory';

export const metadata: Metadata = { title: 'My trips' };

export default function TripsPage() {
  return (
    <>
      <PageHeader title="My trips" description="Your saved commutes, newest first." />
      <TripHistory />
    </>
  );
}
