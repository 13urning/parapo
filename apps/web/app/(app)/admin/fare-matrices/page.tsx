import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { MatrixList } from '@/features/admin/MatrixList';

export const metadata: Metadata = { title: 'Fare matrices' };

export default function FareMatricesPage() {
  return (
    <>
      <PageHeader
        title="Fare matrices"
        description="Draft, review and publish fare updates."
        actions={
          <Link
            href="/admin/fare-matrices/new"
            className="inline-flex min-h-11 items-center rounded-lg bg-jeep-yellow px-4 text-sm font-semibold text-ink shadow-[0_2px_0_0_rgba(20,23,31,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jeep-blue"
          >
            New draft
          </Link>
        }
      />
      <MatrixList />
    </>
  );
}
