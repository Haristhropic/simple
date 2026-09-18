# Draft: user-logs-charts

slug: user-logs-charts
intent: clear
review_required: false
status: plan-written
created: 2026-09-16
approved: 2026-09-16
plan: .omo/plans/user-logs-charts.md

## Request (verbatim intent)

"create a new branch 'user logs charts' and make it for dashboard analystic user who's visited my website in the admin page"

Klarifikasi terakhir dari user: "aku mau nya itu yang simple aja ga terlalu ribet, kayanya pake yang db aja terus layout dynamic simple kaya theme design web ku"

## Findings (evidence)

### Tidak ada data pengunjung sama sekali saat ini
- `prisma/schema.prisma` — 12 model. Tidak ada `PageView` / `Visitor` / `Analytics`.
- grep `analytics|pageview|visitor|trackEvent` di `src/` -> 1 match, hanya teks di `src/app/(public)/privacy/page.tsx`.
- `proxy.ts` matcher `["/admin/:path*"]` — tidak menyentuh halaman publik.
- `package.json` — tidak ada library chart maupun `@vercel/analytics`.

Kesimpulan: ini tiga subsistem (tabel + migrasi, pipeline pengumpulan, halaman admin + chart), bukan "tambah satu halaman".

### Pola repo yang dipakai ulang
- `src/lib/db.ts:13` — singleton `prisma`, diimpor sebagai `@/lib/db`.
- `src/lib/queries/index.ts` — barrel `export *`; query baru ditambahkan di sana.
- `src/lib/validations/contact.ts` — pola Zod (`z.object`, `.min()`, `.max()`, `.optional().nullable()`), di-export dari `src/lib/validations/index.ts`.
- `src/lib/rate-limit.ts:6` — `checkRateLimit(key)` dengan `WINDOW_MS`/`MAX_REQUESTS` yang di-hardcode.
- `src/app/api/upload/route.ts` — pola route handler: `NextRequest`/`NextResponse`, `try/catch`, `console.error`, 500.
- `src/app/admin/(protected)/messages/page.tsx:7` — `export const dynamic = "force-dynamic"` untuk halaman admin yang harus fresh.
- `src/app/admin/(protected)/media/page.tsx:174-202` — pola pill filter; dipakai ulang untuk pemilih rentang.
- `src/components/admin/sidebar.tsx:20-31` — array `navItems`; ikon dari `lucide-react` (dependency yang sudah ada).
- `src/app/globals.css:70-74` (light) dan `:105-109` (dark) — token `--chart-1` .. `--chart-5` sudah ada di kedua tema, ramp grayscale `oklch(x 0 0)`.
- `src/app/admin/(protected)/page.tsx:35-46` — pola kartu stat admin (`grid grid-cols-2 gap-4 lg:grid-cols-4`, `rounded-xl border border-border p-5`, `text-2xl font-medium tracking-tight`).

### Next.js 16 (dibaca dari `node_modules/next/dist/docs/`, sesuai AGENTS.md)
- `middleware` -> **`proxy`** (deprecated di v16). Proxy default Node.js runtime; opsi `runtime` di file proxy akan throw.
- `searchParams` di page component adalah **Promise** dan wajib di-await.
- `after()` stabil dan didokumentasikan untuk analytics, TETAPI di Server Component `headers()`/`cookies()` tidak boleh dipanggil di dalam callback `after`.
- Layout tidak punya akses ke pathname. Itu sebabnya `after()` di layout tidak bisa dipakai untuk mencatat halaman.

### Vercel (tidak dapat diverifikasi dari sesi ini)
- `vercel_list_teams` -> `{"teams": []}`; `vercel_get_git_deployment_context` -> `{"teams": []}`.
- Tidak ada team ID / project ID. Jalur Vercel Web Analytics API tidak bisa diverifikasi.

### Privacy baseline
- `src/app/(public)/privacy/page.tsx:27-29` sudah menyatakan pengumpulan IP address, browser type, dan browsing behavior.
- `:54-56` sudah menyatakan pemakaian analytics cookies.

## Decisions

### Dipilih user (owner-decisions)
1. **DB only.** Vercel Web Analytics dibuang seluruhnya. Tidak ada `@vercel/analytics`, tidak ada Vercel API read, tidak ada env var baru.
2. **Chart agregat saja.** Tidak ada tabel log per-kunjungan di UI.
3. **Chart digambar sendiri.** Tanpa recharts / visx / chart.js / nivo / d3.
4. **Layout publik dynamic.**
5. **Mengikuti tema Maison yang sudah ada.** Monokrom, Geist, `rounded-xl border border-border`, `text-2xl font-medium tracking-tighter` untuk judul, `text-sm text-muted-foreground` untuk sekunder, token `--chart-*` yang sudah ada.

### Default yang diambil (internal, reversible)
- **Nama branch `user-logs-charts`** (kebab-case; nama yang ditulis user mengandung spasi dan merusak tooling git).
- **Pengumpulan lewat client beacon**, bukan `after()` di layout — alasan teknis ada di Findings.
- **Visitor ID = hash bersalt** `sha256(ip | user-agent | ANALYTICS_SALT)`. Tanpa cookie, jadi tidak perlu consent banner dan `privacy/page.tsx` tidak perlu diubah. Salt stabil (env var dengan fallback) supaya "unique visitor" bisa dihitung lintas rentang.
- **Tidak menyimpan IP mentah dan tidak menyimpan User-Agent mentah.** Hanya `device` hasil turunan dan `visitorHash`.
- **Pemilih rentang lewat `?range=7|30|90`**, default 30, dibaca dari `searchParams`, dirender server-side. Tanpa state client.
- **Tidak ada retensi / auto-delete.**
- **`privacy/page.tsx` tidak disentuh.**

## Must-NOT-Have

- Tidak ada `@vercel/analytics`, tidak ada pemanggilan Vercel API, tidak ada env var Vercel.
- Tidak mengubah matcher `proxy.ts`.
- Tidak ada library chart pihak ketiga.
- Tidak ada token warna baru; hanya `--chart-1` .. `--chart-5`.
- Tidak ada cookie banner / consent banner.
- Tidak ada tabel log per-kunjungan di UI.
- Tidak melacak route `/admin`.
- Tidak mengubah `ALLOWED_TYPES`, `next.config.ts` images, atau komponen publik lain selain menambahkan tracker ke layout publik.
- Tidak mengubah model Prisma yang sudah ada.

## Verification plan

- `npx tsc --noEmit` bersih; `npx eslint` pada file yang disentuh bersih.
- `npx prisma migrate dev --name add_page_view` jalan; tabel `PageView` ada.
- `POST /api/track` body valid -> 204 dan satu baris masuk DB; body invalid -> 400.
- `/admin/analytics` render dengan data nol (empty state) dan dengan data.
- Halaman publik tetap 200 setelah layout jadi dynamic.
- Chart render di light dan dark mode.

## Next workflow action

Plan tertulis di `.omo/plans/user-logs-charts.md`. Menunggu user memulai sesi worker terpisah (`/start-work`).

Catatan: `node "<skill-root>/scripts/scaffold-plan.mjs"` tidak bisa dijalankan — sesi ini tidak punya tool shell. Draft dan plan ditulis langsung dengan tool `write` sebagai resume point yang setara.