import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { AnalyticsCharts } from '@/features/admin/AnalyticsCharts';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Page views for the last 14 days. No IPs or third-party trackers." />
      <AnalyticsCharts />
    </>
  );
}
