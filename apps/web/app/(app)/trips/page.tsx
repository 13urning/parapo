import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/ui';
import { TripHistory } from '@/features/trips/TripHistory';

export const metadata: Metadata = { title: 'My trips' };

export default function TripsPage() {
  return (
    <Page>
      <PageHeader title="My trips" />
      <TripHistory />
    </Page>
  );
}
