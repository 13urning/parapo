import { Tag, type TagTone } from '@/components/ui';
import type { MatrixStatus } from '@/lib/api/types';
import { STATUS_LABELS } from '@/lib/format';

// Plain status tags. Amber is reserved for "Cheapest" and live state, so Draft stays neutral.
const tone: Record<MatrixStatus, TagTone> = { DRAFT: 'neutral', PUBLISHED: 'green', ARCHIVED: 'neutral' };

export function StatusBadge({ status }: { status: MatrixStatus }) {
  return (
    <Tag tone={tone[status]} className={status === 'ARCHIVED' ? 'opacity-80' : undefined}>
      {STATUS_LABELS[status]}
    </Tag>
  );
}
