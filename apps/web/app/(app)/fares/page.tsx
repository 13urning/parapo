import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { PublishedFares } from '@/features/fares/PublishedFares';

export const metadata: Metadata = { title: 'Fares' };

export default function FaresPage() {
  return (
    <>
      <PageHeader title="Published fares" description="The current fare matrix for each vehicle type." />
      <PublishedFares />
    </>
  );
}
