import { screen } from '@testing-library/react';
import { analyticsApi } from '@/lib/api/endpoints';
import { renderWithProviders } from '@/tests/test-utils';
import { AnalyticsCharts, summarySentence } from './AnalyticsCharts';

vi.mock('@/lib/api/endpoints', () => ({ analyticsApi: { summary: vi.fn() } }));

describe('summarySentence', () => {
  it('uses the real counts and pluralises', () => {
    expect(summarySentence(41, 8, 14)).toBe('41 views across 8 pages, last 14 days');
    expect(summarySentence(1, 1, 14)).toBe('1 view across 1 page, last 14 days');
  });
});

describe('AnalyticsCharts', () => {
  it('leads with one summary sentence computed from the response, not a stat tile', async () => {
    vi.mocked(analyticsApi.summary).mockResolvedValue({
      total: 41,
      byPath: [
        { path: '/plan', views: 30 },
        { path: '/trips', views: 11 },
      ],
      byDay: [{ date: '2026-10-28', views: 41 }],
    });
    renderWithProviders(<AnalyticsCharts />);
    expect(await screen.findByText('41 views across 2 pages, last 14 days')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Views by page' })).toBeInTheDocument();
  });
});
