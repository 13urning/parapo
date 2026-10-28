import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { PlanTrip } from '@/features/plan/PlanTrip';

export const metadata: Metadata = { title: 'Plan a trip' };

export default function PlanPage() {
  return (
    <>
      <PageHeader title="Plan a trip" description="Pick where you are going and see exactly what to pay." />
      <PlanTrip />
    </>
  );
}
