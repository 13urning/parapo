'use client';

import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { placesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/keys';
import type { Place } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { controlClass } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

interface PlaceComboboxProps {
  label: string;
  placeholder?: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  debounceMs?: number;
}

export const MIN_QUERY_LENGTH = 3;

/** Debounced autocomplete over GET /places/search (ARIA 1.2 combobox pattern). */
export function PlaceCombobox({ label, placeholder, value, onChange, debounceMs = 350 }: PlaceComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const debounced = useDebouncedValue(text.trim(), debounceMs);
  const searching = !value && debounced.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError } = useQuery({
    queryKey: queryKeys.places.search(debounced),
    queryFn: ({ signal }) => placesApi.search(debounced, signal),
    enabled: searching,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const options = searching ? (data ?? []) : [];
  const expanded = open && searching && !isFetching && (options.length > 0 || isError || data !== undefined);

  const choose = (place: Place) => {
    setText(place.label);
    setOpen(false);
    setActive(-1);
    onChange(place);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && expanded && active >= 0 && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
          placeholder={placeholder}
          value={text}
          className={cn(controlClass(false), 'pr-10')}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {isFetching && searching && (
          <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" label="Searching places" />
        )}
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label={`${label} suggestions`}
        hidden={!expanded}
        className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-paper-line bg-white shadow-card"
      >
        {options.map((p, i) => (
          <li
            key={`${p.lat},${p.lng},${p.label}`}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            // mousedown fires before the input blur, so the click is not lost.
            onMouseDown={(e) => {
              e.preventDefault();
              choose(p);
            }}
            className={cn('cursor-pointer px-3 py-2 text-sm', i === active ? 'bg-jeep-blue-soft' : 'hover:bg-stone-50')}
          >
            {p.label}
          </li>
        ))}
        {options.length === 0 && (
          <li role="presentation" className="px-3 py-2 text-sm text-ink-soft">
            {isError ? 'Place search is temporarily unavailable. Please try again in a moment.' : 'No places found.'}
          </li>
        )}
      </ul>
      {!value && text.length > 0 && text.trim().length < MIN_QUERY_LENGTH && (
        <p className="text-xs text-ink-soft">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
      )}
    </div>
  );
}
