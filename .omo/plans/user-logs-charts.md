# Plan: user-logs-charts

Approved by the user on 2026-09-16 ("pake yang db aja terus layout dynamic simple kaya theme design web ku").

## Goal

An admin page at `/admin/analytics` showing aggregate visitor analytics for the public site: total page views, unique visitors, a daily trend chart, and breakdowns by page, referrer, device, and country. Data is collected first-party into the app's own Postgres database. No third-party analytics service, no chart library, no new colour palette.

## Intent

`clear` · `review_required: false`

## Context (verified by exploration, not assumed)

- `prisma/schema.prisma` — 12 models, none for page views. The new model is appended after `Setting` (currently ends at line 175). No existing model changes.
- `src/lib/db.ts:13` — `prisma` singleton, imported as `@/lib/db`.
- `src/lib/queries/index.ts` — barrel of `export * from "./..."`; `./analytics` must be added there.
- `src/lib/validations/index.ts` — barrel for Zod schemas; `./analytics` must be added there.
- `src/lib/validations/contact.ts:3-8` — the schema pattern to copy (`z.object`, `.min()`, `.max()`, `.optional().nullable()`).
- `src/lib/rate-limit.ts:1-21` — `checkRateLimit(key)` with `WINDOW_MS = 60_000` and `MAX_REQUESTS = 10` hardcoded. 10/min is too tight for page views, so the function gains an optional per-call override (backward compatible; existing callers keep current behaviour).
- `src/app/api/upload/route.ts` — the route-handler pattern: `NextRequest`/`NextResponse`, `try/catch`, `console.error`, 500 on failure.
- `src/app/(public)/layout.tsx` — public shell; renders `<Header />` (already a client component), a breadcrumb container, `<main>`, `<Footer />`. No `dynamic` export today.
- `src/app/admin/(protected)/messages/page.tsx:7` — `export const dynamic = "force-dynamic"` is the established pattern for admin pages that must read fresh data.
- `src/app/admin/(protected)/page.tsx:35-46` — the admin stat-card pattern to match visually.
- `src/app/admin/(protected)/media/page.tsx:174-202` — the pill filter pattern to reuse for the range selector.
- `src/components/admin/sidebar.tsx:20-31` — the `navItems` array; Dashboard is first.
- `src/app/globals.css:70-74` (light) and `:105-109` (dark) — `--chart-1` .. `--chart-5` are already defined in both themes as a grayscale `oklch(x 0 0)` ramp, and `@theme inline` maps them to `--color-chart-*`.
- `package.json` — `lucide-react` is already a dependency; there is no chart library and no `@vercel/analytics`.
- Next.js 16, read from `node_modules/next/dist/docs/` (per `AGENTS.md`):
  - `middleware` is renamed to `proxy`; the existing `proxy.ts` matcher `["/admin/:path*"]` is not touched.
  - `searchParams` on a page component is a Promise and must be awaited.
  - `after()` is documented for analytics, but a layout cannot resolve the current pathname, so it cannot be the tracking mechanism here (see Decisions).
- Existing privacy copy (`src/app/(public)/privacy/page.tsx:27-29`, `:54-56`) already discloses IP address, browser type, and browsing behaviour collection, so no legal copy needs to change.

## Decisions

User-owned (explicit answers):
1. **DB only.** No Vercel Web Analytics, no `@vercel/analytics`, no Vercel API read, no new Vercel env var.
2. **Aggregate charts only.** No per-visit log table in the UI.
3. **Hand-drawn charts.** No recharts / visx / chart.js / nivo / d3.
4. **The public layout becomes dynamic.**
5. **Match the existing Maison admin theme.** Monochrome, Geist, `rounded-xl border border-border` surfaces, `text-2xl font-medium tracking-tighter` headings, `text-sm text-muted-foreground` secondary, `--chart-*` tokens only.

Adopted internals (reversible):
- **Branch name `user-logs-charts`** (kebab-case; the requested name contains spaces, which break git tooling).
- **Tracking via a client beacon**, not `after()` in the layout. A layout has no access to the current pathname, so `after()` there could only record "a page was viewed", not which one; the beacon component uses `usePathname()` and posts to `/api/track`. One component plus one route is the smallest correct design.
- **Visitor identity is a stable salted hash**, `sha256(ip | user-agent | ANALYTICS_SALT)`, stored as `visitorHash`. No cookie is set, so no consent banner is required. A stable (not daily-rotating) salt keeps "unique visitors" meaningful across the whole selected range.
- **No raw IP and no raw User-Agent are stored** — only the derived `device` and the `visitorHash`.
- **`export const dynamic = "force-dynamic"` on `(public)/layout.tsx`.** Recorded as a user decision. Consequence stated under Risks.
- **Range selector via `?range=7|30|90`**, default 30, read from `searchParams`, rendered server-side. No client state.
- **No retention job.** Nothing is auto-deleted.
- **`privacy/page.tsx` is not edited.**

## Must NOT have

- No `@vercel/analytics`, no Vercel API call, no Vercel env var.
- No change to the `proxy.ts` matcher (`["/admin/:path*"]` stays).
- No third-party chart library.
- No new colour tokens; `--chart-1` .. `--chart-5` only.
- No cookie banner and no edit to `src/app/(public)/privacy/page.tsx`.
- No per-visit log table in the UI.
- No tracking of `/admin` routes.
- No change to `ALLOWED_TYPES`, `next.config.ts` images, or any existing public component other than mounting the tracker in the public layout.
- No change to any existing Prisma model.

## Todos

- [x] 1. Create the `user-logs-charts` branch from `origin/master`
  - Reference: remote `master` is at `f2110350`. A previous run branched from a stale local `master` and had to be reset, so the base must come from `origin`, not from the local ref.
  - Exact commands, in order:
    ```
    git fetch origin --prune
    git checkout -b user-logs-charts origin/master
    git branch --show-current
    git merge-base --is-ancestor origin/master HEAD
    echo "ancestor_exit=$?"
    git rev-parse HEAD
    git rev-parse origin/master
    ```
  - Acceptance: `git branch --show-current` prints `user-logs-charts`; `ancestor_exit=0`; the two `rev-parse` lines print the same SHA.
  - QA (agent-executed): run the commands above and paste their raw output.
  - Commit: none (branch creation only).

- [x] 2. Add the `PageView` model and run the migration
  - File: `prisma/schema.prisma`. Append after the `Setting` model (currently ends at line 175). Do not modify any existing model.
  - Exact model:
    ```prisma
    model PageView {
      id          String   @id @default(cuid())
      path        String
      visitorHash String
      referrer    String?
      device      String   @default("desktop")
      country     String?
      createdAt   DateTime @default(now())

      @@index([createdAt])
      @@index([visitorHash])
      @@index([path])
    }
    ```
  - Then run: `npx prisma migrate dev --name add_page_view`
  - Acceptance: a new folder exists under `prisma/migrations/`; the `PageView` table exists; the command's `prisma generate` step succeeded.
  - QA (agent-executed): paste the raw output of the migrate command, then run a one-off `npx tsx` snippet that calls `prisma.pageView.count()` and prints the result — it must print `0`.
  - Commit: `feat(analytics): add PageView model`

- [x] 3. Allow a per-call rate-limit window
  - File: `src/lib/rate-limit.ts`, whole file (21 lines).
  - Exact result — the constants are renamed and the signature gains an optional second argument:
    ```ts
    const store = new Map<string, { count: number; resetAt: number }>();

    const DEFAULT_WINDOW_MS = 60_000;
    const DEFAULT_MAX_REQUESTS = 10;

    export function checkRateLimit(
      key: string,
      options?: { windowMs?: number; maxRequests?: number }
    ): { allowed: boolean; remaining: number } {
      const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
      const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
      }

      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count };
    }
    ```
  - Acceptance: every existing caller (`src/app/api/upload/route.ts`, `src/app/api/revalidate/route.ts`, `src/lib/actions/contact.ts`) compiles unchanged and keeps its current 10/min behaviour.
  - QA (agent-executed): `npx tsc --noEmit` returns no output; `npx eslint src/lib/rate-limit.ts` returns no output.
  - Commit: folded into todo 5's commit (`feat(analytics): add PageView tracking endpoint`).

- [x] 4. Add the `pageViewSchema` Zod module
  - New file: `src/lib/validations/analytics.ts`, modelled on `src/lib/validations/contact.ts`.
  - Exact content:
    ```ts
    import { z } from "zod";

    export const pageViewSchema = z.object({
      path: z.string().min(1).max(500),
      referrer: z.string().max(500).optional().nullable(),
    });

    export type PageViewInput = z.infer<typeof pageViewSchema>;
    ```
  - Also edit `src/lib/validations/index.ts`: append `export * from "./analytics";` to the existing list.
  - Acceptance: `import { pageViewSchema } from "@/lib/validations";` resolves; the file exports exactly `pageViewSchema` and `PageViewInput`.
  - QA (agent-executed): `npx tsc --noEmit` returns no output; `npx eslint src/lib/validations/analytics.ts` returns no output.
  - Commit: folded into todo 5's commit (`feat(analytics): add PageView tracking endpoint`).

- [x] 5. Add the `POST /api/track` route handler
  - New file: `src/app/api/track/route.ts`, following `src/app/api/upload/route.ts`.
  - Exact content:
    ```ts
    import { NextRequest, NextResponse } from "next/server";
    import { createHash } from "crypto";
    import { prisma } from "@/lib/db";
    import { pageViewSchema } from "@/lib/validations";
    import { checkRateLimit } from "@/lib/rate-limit";

    function parseDevice(userAgent: string): string {
      if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
      if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile";
      return "desktop";
    }

    function hashVisitor(ip: string, userAgent: string): string {
      const salt = process.env.ANALYTICS_SALT || "maison-analytics-salt";
      return createHash("sha256").update(`${ip}|${userAgent}|${salt}`).digest("hex");
    }

    export async function POST(request: NextRequest) {
      try {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        const rateLimit = checkRateLimit(`track:${ip}`, {
          windowMs: 60_000,
          maxRequests: 120,
        });
        if (!rateLimit.allowed) {
          return new NextResponse(null, { status: 204 });
        }

        const body = await request.json();
        const parsed = pageViewSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (parsed.data.path.startsWith("/admin")) {
          return new NextResponse(null, { status: 204 });
        }

        const userAgent = request.headers.get("user-agent") || "";

        await prisma.pageView.create({
          data: {
            path: parsed.data.path,
            referrer: parsed.data.referrer || null,
            device: parseDevice(userAgent),
            country: request.headers.get("x-vercel-ip-country") || null,
            visitorHash: hashVisitor(ip, userAgent),
          },
        });

        return new NextResponse(null, { status: 204 });
      } catch (error) {
        console.error("Track error:", error);
        return new NextResponse(null, { status: 204 });
      }
    }
    ```
  - Notes the implementer must not "improve" away:
    - The error path returns 204, not 500. The beacon must never surface a failure to a visitor.
    - The invalid-payload path returns 400 so the contract is testable; it is the only non-204 return.
    - No auth check — this endpoint is deliberately public. The rate limit is the only guard.
  - Acceptance: valid body -> 204 and one `PageView` row; invalid body -> 400 and no row; `/admin/*` path -> 204 and no row.
  - QA (agent-executed): with `next dev` running, `curl -i -X POST localhost:3000/api/track -H "Content-Type: application/json" -d '{"path":"/products"}'` -> 204; the same with `-d '{"path":""}'` -> 400; then a `npx tsx` snippet that prints `prisma.pageView.count()` and the newest row's `path`/`device`. Evidence = all raw outputs.
  - Commit: `feat(analytics): add PageView tracking endpoint`

- [x] 6. Add the client tracker and mount it in the public layout
  - New file: `src/components/public/page-view-tracker.tsx`.
  - Exact content:
    ```tsx
    "use client";

    import { useEffect } from "react";
    import { usePathname } from "next/navigation";

    export function PageViewTracker() {
      const pathname = usePathname();

      useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) return;

        const payload = JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
        });

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track",
            new Blob([payload], { type: "application/json" })
          );
          return;
        }

        void fetch("/api/track", {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }, [pathname]);

      return null;
    }
    ```
  - File: `src/app/(public)/layout.tsx` (currently 20 lines). Add the import and mount `<PageViewTracker />` as the first child of the outer `<div>`, and add `export const dynamic = "force-dynamic";` above the component.
  - Acceptance: the component renders `null`; one beacon fires per pathname change; `/admin` never beacons (the tracker is not mounted there anyway, and the guard is belt-and-braces).
  - QA (agent-executed): with `next dev`, open `/`, then `/products`, then `/gallery`; confirm in the browser network panel three `POST /api/track` requests with the matching `path`, and no console errors. Evidence = the request list and the `PageView` rows.
  - Commit: `feat(analytics): track public page views from the client`

- [x] 7. Add `getAnalyticsSummary`
  - New file: `src/lib/queries/analytics.ts`.
  - Exact content:
    ```ts
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
    ```
  - Also edit `src/lib/queries/index.ts`: append `export * from "./analytics";`.
  - Notes the implementer must not "improve" away:
    - The trend axis is filled in JS so every day in the range is present, including zero days. Without it the chart stretches gaps.
    - `to_char(... 'YYYY-MM-DD')` returns a string on purpose, so no timezone re-parsing happens on the way back.
  - Acceptance: returns zeroed trend of exactly `days` points on an empty table; unique visitors counts distinct hashes.
  - QA (agent-executed): with an empty table, a `npx tsx` snippet prints the result of `getAnalyticsSummary(7)` — `totalViews` 0, `trend.length` 7. Then insert three rows (two sharing a `visitorHash`) and re-run — `totalViews` 3, `uniqueVisitors` 2. Evidence = both raw outputs.
  - Commit: `feat(analytics): add aggregate analytics queries`

- [x] 8. Add the trend chart and bar breakdown components
  - New file: `src/components/admin/analytics/trend-chart.tsx`. A Server Component, no `"use client"`. Pure inline SVG, `viewBox="0 0 800 240"`, `className="h-auto w-full"`, `role="img"` with an `aria-label`. Draw five horizontal grid lines in `text-border`, an area fill via a `<linearGradient>` using `currentColor` at 0.16 -> 0 opacity, and a 1.5px line in `text-foreground`. First and last date labels (`MM-DD`) in `fill-muted-foreground text-[10px]`. Guard the empty case: with `data.length === 0` render the grid only, no paths.
  - New file: `src/components/admin/analytics/bar-breakdown.tsx`. A Server Component taking `{ title, rows }`. Renders a `rounded-xl border border-border p-5` surface, a `text-sm font-medium` title, and a `<ul className="space-y-3">`. Each row: label truncated on the left, value right-aligned with `tabular-nums`, and below it a `h-1.5 w-full rounded-full bg-muted` track with an inner `bg-foreground/70` bar whose width is `(value / max) * 100%`. When `rows` is empty render `<p className="text-sm text-muted-foreground">No data yet.</p>`.
  - Notes the implementer must not "improve" away:
    - Both components are Server Components. No hooks, no state, no event handlers. The whole dashboard ships zero chart JavaScript.
    - The `linearGradient` id is `analytics-trend-fill` and is used once per page. Do not duplicate it.
    - Colours come only from the existing `--chart-*` / foreground / border / muted tokens. No hex values.
  - Acceptance: both components render standalone with sample props without a client boundary; the empty case renders without NaN or a broken path.
  - QA (agent-executed): `npx tsc --noEmit` and `npx eslint src/components/admin/analytics/*.tsx` return no output. Then render each once with empty `rows`/`data` in the page from todo 9 and confirm no console errors.
  - Commit: folded into todo 9's commit (`feat(analytics): add admin analytics dashboard`).

- [x] 9. Add the `/admin/analytics` page
  - New file: `src/app/admin/(protected)/analytics/page.tsx`.
  - Exact shape:
    ```tsx
    import type { Metadata } from "next";
    import Link from "next/link";
    import { getAnalyticsSummary } from "@/lib/queries";
    import { TrendChart } from "@/components/admin/analytics/trend-chart";
    import { BarBreakdown } from "@/components/admin/analytics/bar-breakdown";

    export const metadata: Metadata = { title: "Analytics" };
    export const dynamic = "force-dynamic";

    const RANGES = [
      { value: "7", label: "7 days" },
      { value: "30", label: "30 days" },
      { value: "90", label: "90 days" },
    ] as const;

    function parseDays(value: string | undefined): 7 | 30 | 90 {
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
      // header: h1 "Analytics" (text-2xl font-medium tracking-tighter) + p "Visitor activity on the public site."
      // range pills: RANGES.map -> Link href={`/admin/analytics?range=${value}`} using the media-page pill classes
      // stat row: grid grid-cols-2 gap-4 lg:grid-cols-4, two cards -> "Page views" and "Unique visitors"
      // trend: rounded-xl border border-border p-5 wrapping <TrendChart data={data.trend} />
      // breakdowns: grid grid-cols-1 gap-4 lg:grid-cols-2 -> BarBreakdown for topPages, topReferrers, devices, countries
      // empty state: when data.totalViews === 0 render a composed panel instead of the charts
    }
    ```
  - Notes the implementer must not "improve" away:
    - `searchParams` is a Promise in Next 16 and must be awaited. Awaiting it makes the route dynamic; the explicit `dynamic` export documents that intent.
    - `parseDays` clamps unknown values to 30 rather than throwing.
    - Reuse the exact pill classes from `src/app/admin/(protected)/media/page.tsx:174-202` so the range selector matches the rest of the admin.
    - The empty state is a real composed panel, not an empty chart.
  - Acceptance: `/admin/analytics`, `/admin/analytics?range=7`, `?range=90` all render 200; `?range=bogus` renders the 30-day view; the empty state appears on an empty table.
  - QA (agent-executed): with `next dev`, `curl -s -o /dev/null -w "%{http_code}"` for each of the four URLs -> all 200. Then screenshot or dump the rendered HTML for the empty-table case and the populated case. Evidence = the four status codes plus the two render captures.
  - Commit: `feat(analytics): add admin analytics dashboard`

- [x] 10. Add the Analytics sidebar entry
  - File: `src/components/admin/sidebar.tsx`. Add `BarChart3` to the existing `lucide-react` import list, and insert `{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }` into `navItems` immediately after the Dashboard entry (line 21).
  - Acceptance: the entry appears directly under Dashboard, uses `BarChart3`, and the existing active-state logic (`pathname === item.href || pathname.startsWith(item.href + "/")`) highlights it on `/admin/analytics`.
  - QA (agent-executed): `npx tsc --noEmit` returns no output; load `/admin/analytics` and confirm the sidebar item is highlighted. Evidence = raw tsc output plus the rendered state.
  - Commit: folded into todo 9's commit (`feat(analytics): add admin analytics dashboard`).

- [x] 11. Push `user-logs-charts`
  - Exact command: `git push -u origin user-logs-charts`
  - Acceptance: `github_list_branches` on `Haristhropic/simple` lists `user-logs-charts`; `git log origin/user-logs-charts..HEAD --oneline` is empty.
  - QA (agent-executed): the raw push output plus the branch list. Evidence = both.
  - Commit: none (push only).

## Final verification wave

- [x] F1. Static checks are clean
  - `npx tsc --noEmit` and `npx eslint src/lib/rate-limit.ts src/lib/validations/analytics.ts src/app/api/track/route.ts src/components/public/page-view-tracker.tsx src/lib/queries/analytics.ts src/components/admin/analytics/trend-chart.tsx src/components/admin/analytics/bar-breakdown.tsx "src/app/admin/(protected)/analytics/page.tsx" src/components/admin/sidebar.tsx` — all must produce no output. Evidence = the raw command outputs. Depends on todos 3 through 10.

- [x] F2. The migration is applied and the table is real
  - `npx prisma migrate status` reports no pending migrations; a `npx tsx` snippet confirms `prisma.pageView.count()` resolves to a number. Evidence = both raw outputs. Depends on todo 2.

- [x] F3. The tracking endpoint honours its contract
  - Valid body -> 204 plus exactly one new `PageView` row; empty `path` -> 400 plus no new row; `path` starting with `/admin` -> 204 plus no new row. Evidence = the three `curl -i` outputs and the row count after each. Depends on todos 2, 4, 5.

- [x] F4. The dashboard renders empty and populated, light and dark
  - On an empty table: `/admin/analytics` renders the composed empty state, no broken SVG, no NaN.
  - After seeding at least two days of rows with at least two distinct `visitorHash` values: stat cards show the right totals, the trend line spans the full range with zero-days included, and all four breakdowns list rows.
  - Repeat both in light and dark mode. Evidence = render captures for each state plus the seeded row dump. Depends on todos 7, 8, 9.

- [x] F5. The public site has not regressed
  - `/`, `/products`, `/gallery`, `/about`, `/contact` all return 200 after the layout became dynamic.
  - No console errors from the tracker; one `POST /api/track` per navigation; `/admin` produces none.
  - `proxy.ts` is unmodified (`git diff origin/master -- proxy.ts` is empty). Evidence = the status codes, the network log, and the empty diff. Depends on todos 5, 6.

## Dependency matrix

`1 -> 2` and `1 -> 3` and `1 -> 4`; `3,4 -> 5`; `5 -> 6`; `6 -> F5`; `2 -> 7`; `7 -> 8`; `8 -> 9`; `9 -> 10`; `2,5,6,7,9,10 -> 11`; `F1` after `3`-`10`; `F2` after `2`; `F3` after `2,4,5`; `F4` after `7,8,9`; `F5` after `5,6`.

## Risks and how the plan absorbs them

- **`force-dynamic` on the public layout removes static prerendering for every public page.** This is a user-requested change, recorded in Decisions. It costs build-time caching but guarantees fresh CMS content. Reversible by deleting the one export.
- **Client beacons can be blocked by ad-blockers and privacy extensions**, undercounting views. Accepted for a first-party practicum dashboard; the server-side alternative cannot resolve the pathname without touching the auth proxy.
- **`BETTER_AUTH_SECRET` is not reused as the analytics salt** — a dedicated `ANALYTICS_SALT` with a fallback is used, so rotating an auth secret does not silently reset visitor continuity. If the env var is absent the fallback keeps the feature working.
- **The stable salt means a visitor is pseudonymously linkable across days.** Disclosed by the existing privacy copy; no consent banner required under a no-cookie, hashed-identifier approach.
- **The in-memory rate-limit `Map` resets on cold start and is per-instance**, so the 120/min cap is best-effort on serverless. Acceptable for an abuse guard on a low-traffic practicum site.
- **`$queryRaw` with `date_trunc` is Postgres-specific.** That is correct here — the datasource is Postgres via Neon — but it would need rewriting on another engine.
- **A brand-new `ANALYTICS_SALT` env var is optional, not required.** If the user prefers a required secret, that is a one-line change to the fallback; it is not treated as an owner-decision because the fallback keeps the feature functional and the value is reversible.