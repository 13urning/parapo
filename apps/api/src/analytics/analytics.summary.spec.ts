import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

function setup(dayRows: { date: string; views: number }[], total = 0) {
  const prisma = {
    pageView: {
      groupBy: jest.fn().mockResolvedValue([
        { path: '/plan', _count: { _all: 5 } },
        { path: '/trips', _count: { _all: 5 } },
      ]),
      count: jest.fn().mockResolvedValue(total),
    },
    $queryRaw: jest.fn().mockResolvedValue(dayRows),
  };
  return { prisma, service: new AnalyticsService(prisma as unknown as PrismaService) };
}

// 2026-10-28T18:00Z is already 2026-10-29 02:00 in Manila (UTC+8).
const now = new Date('2026-10-28T18:00:00Z');

describe('AnalyticsService.summary', () => {
  it('zero-fills 14 Manila days ending today and maps counts', async () => {
    const { service } = setup(
      [
        { date: '2026-10-29', views: 3 },
        { date: '2026-10-20', views: 7 },
      ],
      10,
    );
    const res = await service.summary(14, now);

    expect(res.byDay).toHaveLength(14);
    expect(res.byDay[0]).toEqual({ date: '2026-10-16', views: 0 });
    expect(res.byDay[13]).toEqual({ date: '2026-10-29', views: 3 });
    expect(res.byDay.find((d) => d.date === '2026-10-20')?.views).toBe(7);
    expect(res.byDay.filter((d) => d.views === 0)).toHaveLength(12);
    expect(res.total).toBe(10);
    expect(res.byPath).toEqual([
      { path: '/plan', views: 5 },
      { path: '/trips', views: 5 },
    ]);
  });

  it('uses the Manila midnight 13 days back as the window start for every query', async () => {
    const { prisma, service } = setup([]);
    await service.summary(14, now);
    const since = new Date('2026-10-15T16:00:00Z'); // 2026-10-16 00:00 Manila
    expect(prisma.pageView.groupBy.mock.calls[0][0].where.createdAt.gte).toEqual(since);
    expect(prisma.pageView.count.mock.calls[0][0].where.createdAt.gte).toEqual(since);
    // tagged template: (strings, ...params)
    expect(prisma.$queryRaw.mock.calls[0][1]).toEqual(since);
  });

  it('breaks ties deterministically with path asc', async () => {
    const { prisma, service } = setup([]);
    await service.summary(14, now);
    expect(prisma.pageView.groupBy.mock.calls[0][0].orderBy).toEqual([
      { _count: { path: 'desc' } },
      { path: 'asc' },
    ]);
  });

  it('supports a 1-day window', async () => {
    const { service } = setup([]);
    const res = await service.summary(1, now);
    expect(res.byDay).toEqual([{ date: '2026-10-29', views: 0 }]);
  });
});
