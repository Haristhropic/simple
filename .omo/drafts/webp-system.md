# Draft: webp-system

slug: webp-system
intent: clear
review_required: false
status: plan-written
created: 2026-09-16
approved: 2026-09-16 ("boleh")
plan: .omo/plans/webp-system.md

## Request (verbatim intent)
"ini kok format foto nya kok gak .webp" → "buat branch baru aja namanya webp-system and then kamu bisa kerjain" → "boleh".
Cakupan yang dipilih user lewat pertanyaan: **termasuk migrasi aset lama**, bukan hanya upload baru.

## Findings (evidence)
- Akar masalah: `src/lib/cloudinary.ts:9-14` — `uploadImage()` tidak menyetel `format`.
- Satu pintu: `src/app/api/upload/route.ts:41` → 14 pemakai `ImageUploader` semuanya lewat `/api/upload`.
- `ALLOWED_TYPES` (`api/upload/route.ts:6`) sudah menerima jpeg/png/webp/avif — tidak perlu ubah.
- `next.config.ts:15-18` sudah mengizinkan `res.cloudinary.com` — tidak perlu ubah.
- Helper `listImages()` (`src/lib/cloudinary.ts:31-73`) sudah ada, dipakai ulang oleh skrip migrasi.
- Kolom DB ber-URL Cloudinary: `ProductImage.url`, `Category.imageUrl`, `HeroBanner.imageUrl`, `AboutSection.imageUrl`, `GalleryImage.url`.
- Kunci join stabil: `ProductImage.publicId`, `HeroBanner.imagePublicId`, `AboutSection.imagePublicId`, `GalleryImage.publicId`. `Category` tidak punya kolom public-id → dicocokkan via string URL.
- Konfirmasi Cloudinary SDK: `format` = opsi upload (mengubah aset tersimpan), beda dari `fetch_format: 'auto'` (hanya URL delivery). `overwrite` dan `invalidate` juga opsi upload yang valid.

## Decisions (owner-decision resolved by user)
- Cakupan: **termasuk migrasi aset lama** (dipilih user).
- Skrip migrasi: **dry-run default**, harus `--apply` untuk menulis.
- Konversi **in-place**: `public_id` sama + `overwrite: true` + `invalidate: true`. Satu aset per public id, kolom publicId tetap valid, tidak ada duplikat di media manager.
- Branch `webp-system` dibuat dari `master`, terpisah dari `breadcrumbs-nav`.
- Batas migrasi: hanya prefix `maison`.

## Must-NOT-Have
- Tidak mengubah `ALLOWED_TYPES`, `next.config.ts`, `ImageUploader`, atau komponen/halaman lain.
- Tidak menjalankan migrasi otomatis saat build/dev/start/deploy.
- Tidak menyentuh aset di luar prefix `maison`.
- Tidak ada penghapusan eksplisit; tidak ada perubahan schema Prisma.

## Verification plan
- `npx tsc --noEmit` + `npx eslint src/lib/cloudinary.ts scripts/migrate-webp.ts` bersih.
- Dry-run mencetak daftar aset non-webp + nol tulisan.
- Setelah `--apply`: ringkasan `N converted, 0 failed, M row(s) updated`, satu `ProductImage.url` berakhiran `.webp`, halaman publik tetap 200.
- Upload JPEG baru lewat `/admin/media` → URL berakhiran `.webp`.

## Next workflow action
Plan tertulis di `.omo/plans/webp-system.md`. Menunggu user memulai sesi worker terpisah (`/start-work`) — Prometheus tidak mengeksekusi. Opsi high-accuracy review ditawarkan (tidak diminta).