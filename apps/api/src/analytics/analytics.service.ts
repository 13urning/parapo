import { Injectable } from '@nestjs/common';
import { manilaDateString, startOfDayManila } from '../common/time';
import { PrismaService } from '../prisma/prisma.service';

/** Drops any query string / fragment: only the path is ever stored. */
export const stripQuery = (path: string): string => path.split(/[?#]/, 1)[0];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(path: string, userId: string | null): Promise<void> {
    // No IP address, no user agent, no query string.
    await this.prisma.pageView.create({ data: { path: stripQuery(path), userId } });
  }

  async summary(days: number, now: Date = new Date()) {
    const since = startOfDayManila(now, days - 1);
    const [byPathRaw, dayRows, total] = await Promise.all([
      this.prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: [{ _count: { path: 'desc' } }, { path: 'asc' }],
        take: 100,
      }),
      this.prisma.$queryRaw<{ date: string; views: number }[]>`
        SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD') AS date,
               COUNT(*)::int AS views
        FROM "PageView"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1`,
      this.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    ]);

    const counts = new Map(dayRows.map((r) => [r.date, Number(r.views)]));
    const byDay: { date: string; views: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = manilaDateString(startOfDayManila(now, i));
      byDay.push({ date, views: counts.get(date) ?? 0 });
    }
    return {
      byPath: byPathRaw.map((r) => ({ path: r.path, views: r._count._all })),
      byDay,
      total,
    };
  }
}
