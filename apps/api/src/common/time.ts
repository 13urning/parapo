const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000; // Asia/Manila is UTC+8, no DST

/** Start (UTC instant) of the current calendar month in Manila time. */
export function startOfMonthManila(now: Date = new Date()): Date {
  const local = new Date(now.getTime() + MANILA_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - MANILA_OFFSET_MS);
}

/** YYYY-MM-DD of the given instant in Manila time. */
export function manilaDateString(d: Date): string {
  return new Date(d.getTime() + MANILA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Start (UTC instant) of the Manila day `daysAgo` days before `now`. */
export function startOfDayManila(now: Date, daysAgo: number): Date {
  const local = new Date(now.getTime() + MANILA_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysAgo) -
      MANILA_OFFSET_MS,
  );
}
