import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, buttonClass } from '@/components/ui';
import { MatrixList } from '@/features/admin/MatrixList';

export const metadata: Metadata = { title: 'Fare matrices' };

export default function FareMatricesPage() {
  return (
    <>
      <PageHeader
        title="Fares by vehicle"
        description="Draft, review and publish fare updates."
        actions={
          <Link href="/admin/fare-matrices/new" className={buttonClass({ size: 'md' })}>
            New draft
          </Link>
        }
      />
      <MatrixList />
    </>
  );
}
