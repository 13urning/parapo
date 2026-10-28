import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { MatrixEditor } from '@/features/admin/MatrixEditor';

export const metadata: Metadata = { title: 'Edit fare matrix' };

export default async function FareMatrixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Fare matrix" />
      <div className="max-w-2xl">
        <MatrixEditor id={id} />
      </div>
    </>
  );
}
