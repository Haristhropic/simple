import { prisma } from "@/lib/db";

export type AnalyticsRange = 7 | 30 | 90;

export type TrendPoint = { date: string; views: number; visitors: number };
export type BreakdownRow = { label: string; value: number };

export type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  trend: TrendPoint[];
  topPages: BreakdownRow[];
  topReferrers: BreakdownRow[];
  devices: BreakdownRow[];
  countries: BreakdownRow[];
};

export async function getAnalyticsSummary(days: AnalyticsRange): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalViews, uniqueRows, trendRows, topPages, topReferrers, devices, countries] =
    await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT "visitorHash")::int AS count
        FROM "PageView"
        WHERE "createdAt" >= ${since}
      `,
      prisma.$queryRaw<Array<{ day: string; views: number; visitors: number }>>`
        SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS views,
               COUNT(DISTINCT "visitorHash")::int AS visitors
        FROM "PageView"
        WHERE "createdAt" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `,
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.pageView.groupBy({
        by: ["referrer"],
        where: { createdAt: { gte: since }, referrer: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 8,
      }),
      prisma.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { device: "desc" } },
      }),
      prisma.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: since }, country: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 8,
      }),
    ]);

  const byDay = new Map(trendRows.map((r) => [r.day, r]));
  const trend: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    trend.push({ date: key, views: row?.views ?? 0, visitors: row?.visitors ?? 0 });
  }

  return {
    totalViews,
    uniqueVisitors: Number(uniqueRows[0]?.count ?? 0),
    trend,
    topPages: topPages.map((r) => ({ label: r.path, value: r._count._all })),
    topReferrers: topReferrers.map((r) => ({
      label: r.referrer ?? "direct",
      value: r._count._all,
    })),
    devices: devices.map((r) => ({ label: r.device, value: r._count._all })),
    countries: countries.map((r) => ({
      label: r.country ?? "unknown",
      value: r._count._all,
    })),
  };
}