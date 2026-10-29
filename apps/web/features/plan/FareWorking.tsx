import { ChevronDownIcon } from '@/components/icons';
import type { FareMatrix, FareQuote } from '@/lib/api/types';
import { CATEGORY_LABELS, VEHICLE_LABELS, formatDate, formatKm, formatPeso } from '@/lib/format';

interface FareWorkingProps {
  quote: FareQuote;
  /** The published matrix the quote came from, when it could be loaded. */
  matrix?: FareMatrix;
  estimated: boolean;
}

/** "Show the working": which matrix, which distance, which discount, for the ride that is selected. */
export function FareWorking({ quote, matrix, estimated }: FareWorkingProps) {
  const hasDiscount = quote.discountApplied && quote.regularFare > quote.fare;
  const extraKm = matrix ? Math.max(0, Math.ceil(quote.distanceKm - matrix.baseKm)) : null;

  const rows: [string, string][] = [
    ['Fare matrix', `${VEHICLE_LABELS[quote.vehicleType]}, effective ${formatDate(quote.matrixEffectiveDate)}`],
    ['Distance', `${formatKm(quote.distanceKm)}${estimated ? ' (straight-line estimate)' : ' by road'}`],
  ];
  if (matrix && extraKm !== null) {
    rows.push(['Base fare', `${formatPeso(matrix.baseFare)} covers the first ${matrix.baseKm} km`]);
    rows.push([
      'Extra distance',
      extraKm > 0 ? `${extraKm} km × ${formatPeso(matrix.perKmRate)} (rounded up)` : 'None, within the base distance',
    ]);
  }
  rows.push(['Regular fare', formatPeso(quote.regularFare)]);
  if (hasDiscount) {
    rows.push([
      `${CATEGORY_LABELS[quote.fareCategory]} discount`,
      matrix ? `${matrix.discountPercent}% off, you pay ${formatPeso(quote.fare)}` : `you pay ${formatPeso(quote.fare)}`,
    ]);
  }

  return (
    <details className="group border-t border-line">
      <summary className="press flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
        How this fare is worked out
        <ChevronDownIcon size={20} className="shrink-0 text-ink-soft transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <dl className="space-y-2 pb-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="shrink-0 text-ink-soft">{k}</dt>
            <dd className="text-right font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="pb-3 text-[13px] leading-snug text-ink-soft">
        Fares round to the nearest ₱0.25. Seeded fares are illustrative LTFRB-style values, not an official LTFRB fare guide.
      </p>
    </details>
  );
}
