import { computeFare } from '@/lib/fare';
import { formatPeso } from '@/lib/format';
import type { FareMatrix } from '@/lib/api/types';

interface FareTableProps {
  matrix: Pick<FareMatrix, 'baseFare' | 'baseKm' | 'perKmRate' | 'discountPercent'>;
  maxKm?: number;
}

/** Display-only table of fares for 1..maxKm, computed client-side with the contract formula. */
export function FareTable({ matrix, maxKm = 20 }: FareTableProps) {
  const rows = Array.from({ length: maxKm }, (_, i) => i + 1);
  return (
    <div className="overflow-x-auto rounded-xl border border-paper-line bg-white">
      <table className="w-full text-sm">
        <caption className="sr-only">Fares for 1 to {maxKm} kilometres</caption>
        <thead className="bg-ink text-left text-white">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Distance</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Regular</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">
              Student / Senior / PWD ({matrix.discountPercent}% off)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-line">
          {rows.map((km) => {
            const reg = computeFare(matrix, km, 'REGULAR');
            const disc = computeFare(matrix, km, 'STUDENT');
            return (
              <tr key={km} className="odd:bg-stone-50/60">
                <th scope="row" className="px-4 py-2 text-left font-medium">{km} km</th>
                <td className="px-4 py-2 text-right tabular-nums">{formatPeso(reg.fare)}</td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums text-jeep-blue-dark">{formatPeso(disc.fare)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
