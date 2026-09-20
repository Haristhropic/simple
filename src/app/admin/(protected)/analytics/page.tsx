import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/queries";
import { TrendChart } from "@/components/admin/analytics/trend-chart";
import { BarBreakdown } from "@/components/admin/analytics/bar-breakdown";
import type { AnalyticsRange } from "@/lib/queries";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

function parseDays(value: string | undefined): AnalyticsRange {
  if (value === "7") return 7;
  if (value === "90") return 90;
  return 30;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = parseDays(range);
  const data = await getAnalyticsSummary(days);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visitor activity on the public site.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/analytics?range=${r.value}`}
            className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-medium transition-colors ${
              String(days) === r.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {data.totalViews === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-medium">No visitor data yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Visit the public site from a browser. Page views are recorded once the tracker fires.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-border p-5">
              <p className="text-2xl font-medium tracking-tight tabular-nums">{data.totalViews}</p>
              <p className="mt-1 text-sm text-muted-foreground">Page views</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-2xl font-medium tracking-tight tabular-nums">{data.uniqueVisitors}</p>
              <p className="mt-1 text-sm text-muted-foreground">Unique visitors</p>
            </div>
          </div>

          <div className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-medium">Daily page views</h2>
            <TrendChart data={data.trend} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BarBreakdown title="Top pages" rows={data.topPages} />
            <BarBreakdown title="Top referrers" rows={data.topReferrers} />
            <BarBreakdown title="Devices" rows={data.devices} />
            <BarBreakdown title="Countries" rows={data.countries} />
          </div>
        </>
      )}
    </div>
  );
}