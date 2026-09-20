# Plan: webp-system

Approved by the user ("boleh") on 2026-09-16. Supersedes the scratch note `.omo/plans/webp-upload-conversion.md`.

## Goal

Every image uploaded through the admin panel is stored on Cloudinary as WebP, and every image already stored under the app's `maison` folder prefix is converted to WebP with every database URL updated to the new `.webp` URL.

## Intent

`clear` · `review_required: false`

## Context (verified by exploration, not assumed)

- `src/lib/cloudinary.ts:9-14` — `uploadImage()` omits `format`, so Cloudinary keeps the source format (JPEG/PNG/AVIF).
- `src/app/api/upload/route.ts:41` — the single call site of `uploadImage()`. Every admin uploader reaches it: `ImageUploader` (`src/components/admin/image-uploader.tsx:37`) posts to `/api/upload`, and `ImageUploader` has 14 call sites (product form, hero form, about form, gallery grid, category new/edit, media page). One change covers every flow.
- `src/app/api/upload/route.ts:6` — `ALLOWED_TYPES` already accepts `image/jpeg`, `image/png`, `image/webp`, `image/avif`. No change needed.
- `next.config.ts:15-18` — `res.cloudinary.com` already present in `images.remotePatterns`. Next/Image will accept the new `.webp` URLs. No change needed.
- `src/lib/cloudinary.ts:31-73` — `listImages({ folder, cursor, max })` returns `{ assets: { publicId, url, format, bytes, width, height, createdAt, folder }[], nextCursor }` and forwards `folder` to Cloudinary as the `prefix` filter. Reused by the migration script instead of a new listing helper.
- `src/lib/db.ts:13` — `prisma` singleton, imported by scripts as `await import("../src/lib/db")` (precedent: `scripts/seed.ts:9`, `scripts/seed.ts:14` calls `$disconnect`).
- Script runner: `npx tsx scripts/<file>.ts` (README "Scripts" table; `tsx` is already the documented runner for `scripts/seed.ts`).
- Database columns that hold Cloudinary URLs (`prisma/schema.prisma`): `ProductImage.url` (line 106), `Category.imageUrl` (74), `HeroBanner.imageUrl` (124), `AboutSection.imageUrl` (139), `GalleryImage.url` (151). A repo-wide grep for `res.cloudinary.com` found no other URL-bearing column.
- Stable join keys for the URL rewrite: `ProductImage.publicId` (107), `HeroBanner.imagePublicId` (125), `AboutSection.imagePublicId` (140), `GalleryImage.publicId` (152). `Category` has no public-id column, so it is matched by exact URL string.
- Cloudinary Node SDK confirms `format` is a valid `uploader.upload` option and is distinct from `fetch_format: "auto"`: `format` changes the stored asset, `fetch_format` only rewrites the delivery URL. `overwrite` and `invalidate` are also accepted upload options.

## Decisions (recorded)

- Scope: new uploads **and** existing assets. The user explicitly chose the migration option when asked.
- The migration is **dry-run by default**; it writes nothing unless invoked with `--apply`.
- Conversion is **in place**: same `public_id`, `overwrite: true`, `invalidate: true`. One asset per public id, all `publicId` / `imagePublicId` columns stay valid, no duplicate assets cluttering the media manager. Accepted trade-off: the original-format asset in Cloudinary is replaced.
- Migration scope is limited to the `maison` prefix (all app uploads). Assets outside that prefix are never listed, never converted, never deleted.
- Branch `webp-system` is created from `master`, so it stays independent of the existing `breadcrumbs-nav` branch.

## Must NOT have

- No change to `ALLOWED_TYPES` in `src/app/api/upload/route.ts`.
- No change to `next.config.ts`.
- No change to `src/components/admin/image-uploader.tsx` or any other component or page.
- No automatic migration on `npm run build`, `next dev`, `next start`, or deploy. The script is manual only.
- No touching of Cloudinary assets outside the `maison` prefix.
- No deletions beyond what `overwrite: true` on the same public id implies. No `deleteImage` calls.
- No Prisma schema change, no new column, no data migration framework.

## Todos

- [x] 1. Create the `webp-system` branch from `master`
  - Reference: the working tree currently sits on `breadcrumbs-nav` (commit `90c72f6`). The base must be `master`, not `breadcrumbs-nav`.
  - Exact commands, in order:
    ```
    git checkout master
    git checkout -b webp-system
    ```
  - Acceptance: `git branch --show-current` prints `webp-system`; `git merge-base --is-ancestor master HEAD` exits 0.
  - QA (agent-executed): run the two commands, then `git branch --show-current` and `git merge-base --is-ancestor master HEAD; echo $?`. Evidence = raw output of all three.
  - Commit: none (branch creation only).

- [x] 2. Make `uploadImage()` store WebP
  - File: `src/lib/cloudinary.ts`, lines 9-14.
  - Exact result (replace the whole function body; the two existing options must stay, one line is added):
    ```ts
    export async function uploadImage(file: string, folder?: string) {
      return cloudinary.uploader.upload(file, {
        folder: folder || "maison",
        resource_type: "image",
        format: "webp",
      });
    }
    ```
  - Acceptance: the options object literal passed to `cloudinary.uploader.upload` contains exactly three properties — `folder`, `resource_type`, `format: "webp"` — and nothing else in the file changes.
  - QA (agent-executed): `npx tsc --noEmit` (expect no output) and `npx eslint src/lib/cloudinary.ts` (expect no output). Evidence = both raw command outputs.
  - Commit: `feat: store uploaded images as webp`

- [x] 3. Add the one-off migration script `scripts/migrate-webp.ts`
  - New file: `scripts/migrate-webp.ts`. Model it on `scripts/seed.ts` (top-level `import "dotenv/config"`, dynamic imports of app modules, `prisma.$disconnect()` before exit, `.catch` that exits 1).
  - Exact content:
    ```ts
    import "dotenv/config";

    const APPLY = process.argv.includes("--apply");
    const PREFIX = "maison";

    type Candidate = { publicId: string; fromFormat: string; fromUrl: string };
    type Result = Candidate & { toUrl: string | null; error: string | null };

    async function main() {
      const { cloudinary, listImages } = await import("../src/lib/cloudinary");
      const { prisma } = await import("../src/lib/db");

      const candidates: Candidate[] = [];
      let cursor: string | undefined;
      do {
        const page = await listImages({ folder: PREFIX, cursor, max: 100 });
        for (const asset of page.assets) {
          if (asset.format === "webp") continue;
          candidates.push({
            publicId: asset.publicId,
            fromFormat: asset.format,
            fromUrl: asset.url,
          });
        }
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      console.log(
        `${APPLY ? "APPLY" : "DRY RUN"} - ${candidates.length} non-webp asset(s) under prefix "${PREFIX}"`,
      );

      const results: Result[] = [];
      for (const c of candidates) {
        if (!APPLY) {
          results.push({ ...c, toUrl: null, error: null });
          console.log(`  would convert ${c.fromFormat} -> webp  ${c.publicId}`);
          continue;
        }
        try {
          const res = await cloudinary.uploader.upload(c.fromUrl, {
            public_id: c.publicId,
            resource_type: "image",
            format: "webp",
            overwrite: true,
            invalidate: true,
          });
          results.push({ ...c, toUrl: res.secure_url as string, error: null });
          console.log(`  converted ${c.publicId} -> ${res.secure_url}`);
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          results.push({ ...c, toUrl: null, error });
          console.error(`  FAILED ${c.publicId}: ${error}`);
        }
      }

      if (!APPLY) {
        console.log("\nDry run complete. Re-run with --apply to write.");
        await prisma.$disconnect();
        return;
      }

      let updated = 0;
      for (const r of results) {
        if (!r.toUrl) continue;
        const [productImages, heroes, abouts, gallery, categories] = await Promise.all([
          prisma.productImage.updateMany({
            where: { publicId: r.publicId },
            data: { url: r.toUrl },
          }),
          prisma.heroBanner.updateMany({
            where: { imagePublicId: r.publicId },
            data: { imageUrl: r.toUrl },
          }),
          prisma.aboutSection.updateMany({
            where: { imagePublicId: r.publicId },
            data: { imageUrl: r.toUrl },
          }),
          prisma.galleryImage.updateMany({
            where: { publicId: r.publicId },
            data: { url: r.toUrl },
          }),
          prisma.category.updateMany({
            where: { imageUrl: r.fromUrl },
            data: { imageUrl: r.toUrl },
          }),
        ]);
        updated +=
          productImages.count + heroes.count + abouts.count + gallery.count + categories.count;
      }

      const failed = results.filter((r) => r.error).length;
      console.log(
        `\nDone. ${results.length - failed} converted, ${failed} failed, ${updated} database row(s) updated.`,
      );
      await prisma.$disconnect();
    }

    main().catch((err) => {
      console.error(err);
      process.exit(1);
    });
    ```
  - Notes the implementer must not "improve" away:
    - `folder` must NOT be passed to `cloudinary.uploader.upload`. The `public_id` already contains the folder path (`maison/...`); passing `folder` would double-prefix it.
    - Do not add a `new Promise`/`Promise.all` around the conversion loop. It is intentionally serial so Cloudinary rate limits are not hit.
    - The `Category` rewrite is the only URL-string match; every other table joins on the public id, so URLs carrying Cloudinary transformation segments still resolve.
  - Acceptance: file exists at `scripts/migrate-webp.ts`; without `--apply` it performs zero Cloudinary writes and zero database writes; with `--apply` it performs both and prints the final summary.
  - QA (agent-executed): `npx tsx scripts/migrate-webp.ts` (dry run). Evidence = raw stdout, which must contain a `DRY RUN` header line and one `would convert` line per non-webp asset.
  - Commit: `feat: add webp migration script for existing cloudinary assets`

- [x] 4. Add the `migrate:webp` npm script
  - File: `package.json`, `scripts` block (currently lines 5-11).
  - Exact addition, after `"lint": "eslint",`:
    ```json
    "migrate:webp": "tsx scripts/migrate-webp.ts",
    ```
  - Acceptance: `npm run migrate:webp` runs the script from todo 3 in dry-run mode.
  - QA (agent-executed): `npm run migrate:webp`. Evidence = raw stdout header line.
  - Commit: fold into todo 3's commit (`feat: add webp migration script for existing cloudinary assets`).

- [x] 5. Push `webp-system`
  - Exact command: `git push -u origin webp-system`
  - Acceptance: `github_list_branches` on `Haristhropic/simple` lists `webp-system`; the local branch has no unpushed commits.
  - QA (agent-executed): raw push output plus the branch list. Evidence = both.
  - Commit: none (push only).

## Final verification wave

- [x] F1. Static checks are clean
  - `npx tsc --noEmit` and `npx eslint src/lib/cloudinary.ts scripts/migrate-webp.ts` — both must produce no output. Evidence = the two raw command outputs. Depends on todos 2 and 3.

- [x] F2. Dry-run report is reviewed before anything is written
  - `npx tsx scripts/migrate-webp.ts` with no `--apply`.
  - Acceptance: the output lists every non-webp asset under `maison` with its current format and public id, and states explicitly that it was a dry run. Zero Cloudinary assets and zero database rows changed.
  - Evidence: raw stdout, presented to the user verbatim. **Stop here and wait for the user's explicit go-ahead before F3.** Depends on todo 3.

- [x] F3. Migration is applied (only after the user says go)
  - `npx tsx scripts/migrate-webp.ts --apply`
  - Acceptance: the final summary line reads `N converted, 0 failed, M database row(s) updated` with `N` equal to the dry-run candidate count; no `FAILED` line without a matching explanation.
  - Post-checks: one `ProductImage.url` value read back from the database ends in `.webp`; the public pages that render those images return HTTP 200.
  - Evidence: raw stdout of the apply run, the read-back row, the HTTP status lines. Depends on F2 plus the user's go-ahead.

- [x] F4. A new upload lands as WebP
  - Upload a JPEG through `/admin/media` (uploader in `src/app/admin/(protected)/media/page.tsx:170`).
  - Acceptance: the response URL from `POST /api/upload` ends in `.webp`, and the media grid renders the thumbnail.
  - Evidence: the returned JSON body and a screenshot or the rendered grid's image `src`. Depends on todo 2 and either a local `next dev` run or a deploy of the branch.

## Dependency matrix

`1 -> 2` and `1 -> 3`; `3 -> 4` (same commit); `2,3 -> 5`; `F1` after `2` and `3`; `F2` after `3`; `F3` after `F2` plus explicit user go-ahead; `F4` after `2` plus a running build.

## Risks and how the plan absorbs them

- `overwrite: true` irreversibly replaces the original-format asset in Cloudinary. Accepted by the user at approval time; the dry run in F2 exists so the exact list is seen before anything is written.
- Assets referenced only through `Category.imageUrl` have no public id and are matched by exact URL string. If a stored string carries extra transformation segments the row is skipped, not corrupted; the run summary makes the miss visible.
- `cloudinary.uploader.upload` fetches each asset from its own `secure_url`, which requires that URL to be reachable from the script host. Per-asset failures are caught, logged, and counted; one failure never aborts the run.
- Assets already in webp are skipped by the `asset.format === "webp"` check, so the script is idempotent and safe to re-run.