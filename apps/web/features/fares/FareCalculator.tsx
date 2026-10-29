'use client';

import { useId, useState } from 'react';
import type { FareCategory, FareMatrix } from '@/lib/api/types';
import { computeFare } from '@/lib/fare';
import { CATEGORY_LABELS, formatDate, formatPeso } from '@/lib/format';

export const MIN_KM = 1;
export const MAX_KM = 30;
const STEP_KM = 0.5;
const LONGEST_KM = 500;

/** Reads what the rider typed. Anything that is not a positive, sensible distance is "no answer". */
export function parseKm(text: string): number | null {
  const n = Number(text.trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n <= LONGEST_KM ? n : null;
}

interface FareCalculatorProps {
  matrix: FareMatrix;
  category: FareCategory;
}

/** Type or drag a distance, read the fare. Computed from the published matrix with the contract formula (display only). */
export function FareCalculator({ matrix, category }: FareCalculatorProps) {
  const inputId = useId();
  const [text, setText] = useState('5');
  const km = parseKm(text);
  const result = km === null ? null : computeFare(matrix, km, category);
  const hasDiscount = !!result && result.discounted && result.regularFare > result.fare;
  const slider = Math.min(MAX_KM, Math.max(MIN_KM, km ?? MIN_KM));
  const pct = ((slider - MIN_KM) / (MAX_KM - MIN_KM)) * 100;

  return (
    <section aria-label="Fare calculator">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId} className="text-[15px] font-bold text-ink">
          Distance
        </label>
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={km === null || undefined}
            aria-describedby={km === null ? `${inputId}-err` : undefined}
            className="h-12 w-24 rounded-[14px] border-2 border-transparent bg-surface px-3 text-right text-lg font-extrabold text-ink focus:bg-white focus-visible:border-brand focus-visible:outline-none aria-[invalid=true]:border-danger"
          />
          <span className="text-[15px] font-bold text-ink-soft">km</span>
        </div>
      </div>
      <input
        type="range"
        aria-label="Distance in kilometres"
        min={MIN_KM}
        max={MAX_KM}
        step={STEP_KM}
        value={slider}
        onChange={(e) => setText(e.target.value)}
        className="range mt-1"
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-xs font-semibold text-ink-soft" aria-hidden="true">
        <span>{MIN_KM} km</span>
        <span>{MAX_KM} km</span>
      </div>

      <div className="mt-6" aria-live="polite">
        <p className="text-[13px] font-semibold text-ink-soft">
          {CATEGORY_LABELS[category]} fare{km !== null ? ` for ${km} km` : ''}
        </p>
        {result ? (
          <>
            <p data-testid="calc-fare" className="mt-1 text-[56px] font-extrabold leading-none tracking-[-0.03em] text-ink">
              {formatPeso(result.fare)}
            </p>
            {hasDiscount && (
              <p className="mt-2 text-[15px] text-ink-soft">
                <s data-testid="calc-regular">{formatPeso(result.regularFare)}</s> regular ·{' '}
                <b className="font-extrabold text-brand">−{matrix.discountPercent}%</b>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-1 text-[56px] font-extrabold leading-none text-ink-faint">–</p>
            <p id={`${inputId}-err`} className="mt-2 text-sm font-semibold text-danger">
              Enter a distance above 0 km.
            </p>
          </>
        )}
      </div>

      <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
        <Term label="Base fare" value={`${formatPeso(matrix.baseFare)} for the first ${matrix.baseKm} km`} />
        <Term label="Each extra km" value={`${formatPeso(matrix.perKmRate)}, rounded up`} />
        <Term label="Discount" value={`${matrix.discountPercent}% off for student, senior citizen and PWD`} />
        <Term label="Effective" value={formatDate(matrix.effectiveDate)} />
      </dl>
      {matrix.notes && <p className="mt-3 text-sm text-ink-soft">{matrix.notes}</p>}
    </section>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-right font-bold text-ink">{value}</dd>
    </div>
  );
}
