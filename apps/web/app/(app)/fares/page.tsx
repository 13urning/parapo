import type { Metadata } from 'next';
import { Page, PageHeader } from '@/components/ui';
import { PublishedFares } from '@/features/fares/PublishedFares';

export const metadata: Metadata = { title: 'Fares' };

export default function FaresPage() {
  return (
    <Page>
      <PageHeader title="Fares" description="Try a distance and see the fare for each vehicle." />
      <PublishedFares />
    </Page>
  );
}
