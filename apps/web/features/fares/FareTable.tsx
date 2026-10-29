import { ChevronDownIcon } from '@/components/icons';
import { computeFare } from '@/lib/fare';
import { formatPeso } from '@/lib/format';
import type { FareMatrix } from '@/lib/api/types';

interface FareTableProps {
  matrix: Pick<FareMatrix, 'baseFare' | 'baseKm' | 'perKmRate' | 'discountPercent'>;
  maxKm?: number;
}

/** Reference only, behind a disclosure: fares for 1..maxKm, computed client-side with the contract formula. */
export function FareTable({ matrix, maxKm = 20 }: FareTableProps) {
  const rows = Array.from({ length: maxKm }, (_, i) => i + 1);
  return (
    <details className="group">
      <summary className="press flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
        See all distances
        <ChevronDownIcon size={20} className="shrink-0 text-ink-soft transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <table className="w-full text-[15px]">
        <caption className="sr-only">Fares for 1 to {maxKm} kilometres</caption>
        <thead>
          <tr className="border-b border-line text-left text-[13px] text-ink-soft">
            <th scope="col" className="py-2 font-semibold">Distance</th>
            <th scope="col" className="py-2 text-right font-semibold">Regular</th>
            <th scope="col" className="py-2 text-right font-semibold">
              {matrix.discountPercent}% off
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((km) => {
            const reg = computeFare(matrix, km, 'REGULAR');
            const disc = computeFare(matrix, km, 'STUDENT');
            return (
              <tr key={km}>
                <th scope="row" className="py-2.5 text-left font-semibold">{km} km</th>
                <td className="py-2.5 text-right">{formatPeso(reg.fare)}</td>
                <td className="py-2.5 text-right font-bold text-brand-dark">{formatPeso(disc.fare)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </details>
  );
}
