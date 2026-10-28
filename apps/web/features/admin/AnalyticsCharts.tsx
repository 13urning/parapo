'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, EmptyState, PageLoader, StatCard } from '@/components/ui';
import { ErrorState } from '@/components/ui/EmptyState';
import { analyticsApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/api/keys';

const DAYS = 14;

export function AnalyticsCharts() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.analytics.summary(DAYS),
    queryFn: () => analyticsApi.summary(DAYS),
  });

  if (isPending) return <PageLoader label="Loading analytics" />;
  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />;
  if (data.total === 0) {
    return <EmptyState icon="📊" title="No page views yet" description={`Nothing recorded in the last ${DAYS} days.`} />;
  }

  const byDay = data.byDay.map((d) => ({ ...d, label: d.date.slice(5) }));
  const byPath = data.byPath.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={`Views, last ${DAYS} days`} value={data.total} tone="yellow" />
        <StatCard label="Distinct pages" value={data.byPath.length} tone="red" />
        <StatCard label="Busiest page" value={<span className="text-xl">{byPath[0]?.path ?? '–'}</span>} tone="blue" />
      </div>

      <Card accent="red" title="Views by path">
        <div className="h-72" role="img" aria-label="Bar chart of page views by path">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPath} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="path" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#C8102E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card accent="blue" title="Views by day">
        <div className="h-72" role="img" aria-label="Line chart of page views per day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#1D4E89" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
