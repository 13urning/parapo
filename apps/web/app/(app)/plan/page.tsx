import type { Metadata } from 'next';
import { PlanTrip } from '@/features/plan/PlanTrip';

export const metadata: Metadata = { title: 'Plan a trip' };

export default function PlanPage() {
  return <PlanTrip />;
}
