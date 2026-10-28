import { Badge, Button, Card } from '@/components/ui';
import type { FareQuote } from '@/lib/api/types';
import { CATEGORY_LABELS, VEHICLE_LABELS, formatDate, formatKm, formatPeso } from '@/lib/format';

interface FareQuoteCardProps {
  quote: FareQuote;
  estimated: boolean;
  durationMin?: number | null;
  onSave: () => void;
  saving?: boolean;
  saved?: boolean;
}

export function FareQuoteCard({ quote, estimated, durationMin, onSave, saving, saved }: FareQuoteCardProps) {
  const savings = Math.max(0, quote.regularFare - quote.fare);
  const hasDiscount = quote.discountApplied && savings > 0;

  return (
    <Card
      accent="yellow"
      title="Your fare"
      description={`${VEHICLE_LABELS[quote.vehicleType]} · ${CATEGORY_LABELS[quote.fareCategory]}`}
      actions={estimated ? <Badge tone="yellow">Estimated distance</Badge> : undefined}
      aria-label="Fare quote"
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {hasDiscount ? 'Discounted fare' : 'Fare'}
          </p>
          <p className="font-display text-5xl font-extrabold text-ink" data-testid="fare">
            {formatPeso(quote.fare)}
          </p>
        </div>
        {hasDiscount && (
          <div className="pb-1">
            <p className="text-sm text-ink-soft">
              Regular fare <s data-testid="regular-fare">{formatPeso(quote.regularFare)}</s>
            </p>
            <Badge tone="green" className="mt-1">
              You save {formatPeso(savings)}
            </Badge>
          </div>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-paper-line pt-4 text-sm">
        <div>
          <dt className="text-ink-soft">Distance</dt>
          <dd className="font-semibold">{formatKm(quote.distanceKm)}</dd>
        </div>
        {durationMin != null && (
          <div>
            <dt className="text-ink-soft">Travel time</dt>
            <dd className="font-semibold">about {Math.round(durationMin)} min</dd>
          </div>
        )}
        <div className="col-span-2 text-xs text-ink-faint">
          Based on the fare matrix effective {formatDate(quote.matrixEffectiveDate)}.
        </div>
      </dl>

      {estimated && (
        <p className="mt-3 rounded-lg bg-jeep-yellow-soft p-3 text-sm text-[#6B4F00]">
          Road routing was unavailable, so distance is a straight-line estimate. Your actual fare may differ slightly.
        </p>
      )}

      <Button className="mt-5 w-full sm:w-auto" size="lg" onClick={onSave} loading={saving} disabled={saved}>
        {saved ? 'Trip saved' : 'Save trip'}
      </Button>
    </Card>
  );
}
