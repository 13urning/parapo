'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './use-reduced-motion';

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

interface TickOptions {
  durationMs?: number;
  /** Wait this long before counting, so a list of prices resolves one after another. */
  delayMs?: number;
}

/**
 * Counts toward `target`: from 0 on first mount, from the last shown value afterwards.
 * Under reduced motion it returns `target` at once and never schedules a frame or timer,
 * so the final figure is always the one in the DOM. Motion never delays input: this only
 * changes what is painted, never what is clickable.
 */
export function useTickingNumber(target: number, { durationMs = 420, delayMs = 0 }: TickOptions = {}): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const shown = useRef(value);

  useEffect(() => {
    if (reduced) {
      shown.current = target;
      setValue(target);
      return;
    }
    const from = shown.current;
    if (from === target) return;
    let frame = 0;
    const step = (start: number) => (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = t >= 1 ? target : from + (target - from) * easeOutQuint(t);
      shown.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step(start));
    };
    const timer = window.setTimeout(() => {
      const start = performance.now();
      frame = requestAnimationFrame(step(start));
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, delayMs, reduced]);

  return value;
}
