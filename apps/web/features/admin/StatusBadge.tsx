import { Badge, type BadgeTone } from '@/components/ui';
import type { MatrixStatus } from '@/lib/api/types';
import { STATUS_LABELS } from '@/lib/format';

const tone: Record<MatrixStatus, BadgeTone> = { DRAFT: 'yellow', PUBLISHED: 'green', ARCHIVED: 'neutral' };

export function StatusBadge({ status }: { status: MatrixStatus }) {
  return <Badge tone={tone[status]}>{STATUS_LABELS[status]}</Badge>;
}
