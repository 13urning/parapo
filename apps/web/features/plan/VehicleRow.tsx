'use client';

import { VehicleIcon } from '@/components/icons';
import { Tag } from '@/components/ui';
import { useTickingNumber } from '@/hooks/use-ticking-number';
import { cn } from '@/lib/cn';
import { VEHICLE_ROW, formatPeso } from '@/lib/format';
import type { VehicleQuote } from '@/lib/quotes';

/** Gap between rows resolving, so the three prices land one after another. */
export const ROW_STAGGER_MS = 40;

function RollingPeso({ value, delayMs }: { value: number; delayMs: number }) {
  const shown = useTickingNumber(value, { delayMs });
  return <>{formatPeso(shown)}</>;
}

interface VehicleRowProps {
  item: VehicleQuote;
  index: number;
  groupName: string;
  selected: boolean;
  cheapest: boolean;
  onSelect: (v: VehicleQuote['vehicleType']) => void;
  onRetry: (v: VehicleQuote['vehicleType']) => void;
}

const rowBase = 'relative isolate flex items-center gap-3.5 rounded-[14px] px-4 py-[18px]';

function Glyph({ item, selected }: { item: VehicleQuote; selected: boolean }) {
  return (
    <span
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink transition-colors duration-200',
        selected ? 'bg-white' : 'bg-surface',
      )}
      aria-hidden="true"
    >
      <VehicleIcon type={item.vehicleType} />
    </span>
  );
}

/** One tall vehicle row: glyph, name and descriptor on the left, the fare right-aligned. */
export function VehicleRow({ item, index, groupName, selected, cheapest, onSelect, onRetry }: VehicleRowProps) {
  const { name, note } = VEHICLE_ROW[item.vehicleType];
  const delayMs = index * ROW_STAGGER_MS;
  const enter = { animationDelay: `${delayMs}ms` };

  const text = (
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base font-bold leading-tight text-ink">
        {name}
        {cheapest && <Tag tone="amber">Cheapest</Tag>}
      </span>
      <span className="mt-0.5 block text-[13px] font-medium text-ink-soft">{note}</span>
    </span>
  );

  if (item.status === 'loading') {
    return (
      <div className="animate-row-in" style={enter}>
        <div className={rowBase} aria-busy="true">
          <Glyph item={item} selected={false} />
          {text}
          <span className="animate-soft-pulse block h-7 w-20 rounded-lg bg-surface" aria-hidden="true" />
          <span className="sr-only">Loading fare</span>
        </div>
      </div>
    );
  }

  if (item.status === 'error') {
    return (
      <div className="animate-row-in" style={enter}>
        <div className={rowBase}>
          <Glyph item={item} selected={false} />
          {text}
          <button
            type="button"
            onClick={() => onRetry(item.vehicleType)}
            className="press min-h-11 rounded-xl px-3 text-sm font-bold text-danger underline underline-offset-2"
          >
            Could not load. Retry
          </button>
        </div>
      </div>
    );
  }

  if (item.status !== 'ready' || !item.quote) {
    // No published matrix for this vehicle: visible, quiet, and not selectable.
    return (
      <div className="animate-row-in" style={enter}>
        <label className={cn(rowBase, 'cursor-not-allowed opacity-90')} aria-disabled="true">
          <input type="radio" name={groupName} disabled aria-label={`${name}, ${note}, no published fare`} className="sr-only" />
          <Glyph item={item} selected={false} />
          {text}
          <span className="max-w-[7rem] text-right text-[13px] font-semibold leading-tight text-ink-soft">No published fare</span>
        </label>
      </div>
    );
  }

  const { quote } = item;
  const hasDiscount = quote.discountApplied && quote.regularFare > quote.fare;

  return (
    <div className="animate-row-in" style={enter}>
      <label
        data-selected={selected}
        className={cn(
          rowBase,
          'press cursor-pointer',
          'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
          selected && 'animate-pop',
        )}
      >
        <span
          className="vrow-fill absolute inset-0 -z-10 rounded-[14px] bg-brand-50 shadow-[inset_0_0_0_2px_#08744C]"
          aria-hidden="true"
        />
        <input
          type="radio"
          name={groupName}
          value={item.vehicleType}
          aria-label={`${name}, ${note}${cheapest ? ', cheapest' : ''}. Fare ${formatPeso(quote.fare)}${
            hasDiscount ? `, regular fare ${formatPeso(quote.regularFare)}` : ''
          }`}
          checked={selected}
          onChange={() => onSelect(item.vehicleType)}
          className="sr-only"
        />
        <Glyph item={item} selected={selected} />
        {text}
        <span className="animate-fade-in ml-auto shrink-0 text-right" style={enter}>
          <span
            data-testid="fare"
            aria-hidden="true"
            className="block text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink"
          >
            <RollingPeso value={quote.fare} delayMs={delayMs} />
          </span>
          {hasDiscount && (
            <span className="mt-1.5 block text-xs font-medium text-ink-soft" aria-hidden="true">
              <s data-testid="regular-fare">{formatPeso(quote.regularFare)}</s> regular
            </span>
          )}
        </span>
      </label>
    </div>
  );
}
