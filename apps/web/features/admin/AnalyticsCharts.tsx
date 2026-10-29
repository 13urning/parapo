'use client';

import { useQuery } from '@tanstack/react-query';
import { EmptyState, PageLoader } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { analyticsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';

const DAYS = 14;

/** "2026-10-28" as "Oct 28", without a timezone shift. */
function dayLabel(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(y, m - 1, d));
}

/** "41 views across 8 pages, last 14 days": the real totals in one sentence. */
export function summarySentence(total: number, pages: number, days: number) {
  return `${total} ${total === 1 ? 'view' : 'views'} across ${pages} ${pages === 1 ? 'page' : 'pages'}, last ${days} days`;
}

/** One plain row per item: the label, the count, and a bar scaled to the largest value. */
function BarList({ rows, label }: { rows: { key: string; label: string; views: number }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <ul aria-label={label} className="divide-y divide-line">
      {rows.map((r, i) => (
        <li key={r.key} className="py-2.5">
          <div className="flex items-baseline justify-between gap-4 text-[15px]">
            <span className="min-w-0 truncate font-semibold text-ink" title={r.label}>
              {r.label}
            </span>
            <span className="shrink-0 font-extrabold text-ink">{r.views}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
            <div
              className="animate-bar h-full rounded-full bg-brand"
              style={{ width: `${(r.views / max) * 100}%`, animationDelay: `${Math.min(i, 14) * 30}ms` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsCharts() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.analytics.summary(DAYS),
    queryFn: () => analyticsApi.summary(DAYS),
  });

  if (isPending) return <PageLoader label="Loading analytics" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;
  if (data.total === 0) {
    return <EmptyState title="No page views yet" description={`Nothing recorded in the last ${DAYS} days.`} />;
  }

  const byPath = data.byPath.slice(0, 10).map((p) => ({ key: p.path, label: p.path, views: p.views }));
  const byDay = data.byDay.map((d) => ({ key: d.date, label: dayLabel(d.date), views: d.views }));

  return (
    <div className="space-y-8">
      <p className="text-[18px] font-semibold leading-snug text-ink [text-wrap:balance]">{summarySentence(data.total, data.byPath.length, DAYS)}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="by-path">
          <h2 id="by-path" className="border-b border-line pb-2 text-lg font-extrabold text-ink">
            Views by page
          </h2>
          <BarList rows={byPath} label="Views by page" />
        </section>
        <section aria-labelledby="by-day">
          <h2 id="by-day" className="border-b border-line pb-2 text-lg font-extrabold text-ink">
            Views by day
          </h2>
          <BarList rows={byDay} label="Views by day" />
        </section>
      </div>
    </div>
  );
}
