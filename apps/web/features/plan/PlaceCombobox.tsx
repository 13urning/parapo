'use client';

import { useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloseIcon } from '@/components/icons';
import { Spinner } from '@/components/ui/Spinner';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { placesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/keys';
import type { Place } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { shortPlaceLabel } from '@/lib/place-label';

interface PlaceComboboxProps {
  label: string;
  placeholder?: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  debounceMs?: number;
}

export const MIN_QUERY_LENGTH = 3;

/**
 * One row of the From/To stack: a small label, then a bare 16px input. Debounced autocomplete over
 * GET /places/search (ARIA 1.2 combobox pattern). The suggestions open under the stack, full width.
 */
export function PlaceCombobox({ label, placeholder, value, onChange, debounceMs = 350 }: PlaceComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value ? shortPlaceLabel(value.label, 1) : '');
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
  const tooShort = open && !value && text.trim().length > 0 && text.trim().length < MIN_QUERY_LENGTH;

  const choose = (place: Place) => {
    // Show the short name once chosen; the full geocoder label stays in the title.
    setText(shortPlaceLabel(place.label, 1));
    setOpen(false);
    setActive(-1);
    onChange(place);
  };

  const clear = () => {
    setText('');
    setActive(-1);
    if (value) onChange(null);
    inputRef.current?.focus();
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
    <div className="relative">
      <div
        className={cn(
          // The focus box starts at the label column (the marker column stays clear) and runs to the stack edge.
          '-ml-2 -mr-2 flex h-[46px] items-center rounded-[12px] pl-2 pr-2 transition-colors',
          'has-[:focus-visible]:bg-white has-[:focus-visible]:shadow-[inset_0_0_0_2px_#08744C]',
        )}
      >
        <label htmlFor={id} className="w-11 shrink-0 text-xs font-semibold text-ink-soft">
          {label}
        </label>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
          placeholder={placeholder}
          value={text}
          title={value?.label}
          className="h-full min-w-0 flex-1 truncate bg-transparent text-base font-semibold text-ink focus-visible:outline-none"
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
        {isFetching && searching && <Spinner className="mr-2 text-ink-faint" label="Searching places" />}
        {text.length > 0 && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            // Keep focus in the field: mousedown would otherwise blur it and close the list first.
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            className="press -mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-soft"
          >
            <CloseIcon size={18} />
          </button>
        )}
      </div>

      {/* Suggestions span the whole stack: -left-10 / -right-2 mirror the stack's padding. */}
      <ul
        id={listId}
        role="listbox"
        aria-label={`${label} suggestions`}
        hidden={!expanded}
        className="absolute -left-10 -right-2 top-full z-30 mt-1 max-h-64 overflow-auto rounded-[14px] bg-white py-1 shadow-pop ring-1 ring-line"
      >
        {options.map((p, i) => (
          <li
            key={`${p.lat},${p.lng},${p.label}`}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            // mousedown fires before the input blur, so the tap is not lost.
            onMouseDown={(e) => {
              e.preventDefault();
              choose(p);
            }}
            className={cn('flex min-h-12 cursor-pointer items-center px-4 py-2 text-[15px] font-medium text-ink', i === active && 'bg-brand-50')}
          >
            {p.label}
          </li>
        ))}
        {options.length === 0 && (
          <li role="presentation" className="px-4 py-3 text-sm text-ink-soft">
            {isError ? 'Place search is temporarily unavailable. Please try again in a moment.' : 'No places found.'}
          </li>
        )}
      </ul>
      {tooShort && (
        <p className="absolute -left-10 -right-2 top-full z-30 mt-1 rounded-[14px] bg-white px-4 py-3 text-sm text-ink-soft shadow-pop ring-1 ring-line">
          Type at least {MIN_QUERY_LENGTH} characters to search.
        </p>
      )}
    </div>
  );
}
