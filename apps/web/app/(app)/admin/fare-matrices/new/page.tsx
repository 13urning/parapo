import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { MatrixForm } from '@/features/admin/MatrixForm';

export const metadata: Metadata = { title: 'New fare matrix' };

export default function NewFareMatrixPage() {
  return (
    <>
      <PageHeader title="New fare matrix" />
      <div className="max-w-2xl">
        <MatrixForm />
      </div>
    </>
  );
}
