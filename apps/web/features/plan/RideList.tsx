'use client';

import { useId } from 'react';
import type { VehicleType } from '@/lib/api/types';
import type { VehicleQuote } from '@/lib/quotes';
import { VehicleRow } from './VehicleRow';

interface RideListProps {
  items: VehicleQuote[];
  selected: VehicleType | null;
  cheapest: VehicleType | null;
  onSelect: (v: VehicleType) => void;
  onRetry: (v: VehicleType) => void;
}

/** The three vehicle types as one radio group: pick the ride you will take. */
export function RideList({ items, selected, cheapest, onSelect, onRetry }: RideListProps) {
  const groupName = useId();
  return (
    <div role="radiogroup" aria-label="Choose a ride" className="-mx-2 space-y-0.5">
      {items.map((item, i) => (
        <VehicleRow
          key={item.vehicleType}
          item={item}
          index={i}
          groupName={groupName}
          selected={selected === item.vehicleType}
          cheapest={cheapest === item.vehicleType}
          onSelect={onSelect}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
