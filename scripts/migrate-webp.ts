import "dotenv/config";

const APPLY = process.argv.includes("--apply");
const PREFIX = "maison";

type Candidate = { publicId: string; fromFormat: string; fromUrl: string };
type Result = Candidate & { toUrl: string | null; error: string | null };

// Cloudinary's prefix match is loose: prefix "maison" also returns root assets
// whose name merely begins with "Maison", plus the unrelated "maison-test/" folder.
// Only assets that actually live under the app's own tree are migrated.
function isAppAsset(folder: string): boolean {
  return folder === PREFIX || folder.startsWith(`${PREFIX}/`);
}

async function main() {
  const { cloudinary, listImages } = await import("../src/lib/cloudinary");
  const { prisma } = await import("../src/lib/db");

  const candidates: Candidate[] = [];
  let cursor: string | undefined;
  do {
    const page = await listImages({ folder: PREFIX, cursor, max: 100 });
    for (const asset of page.assets) {
      if (asset.format === "webp") continue;
      if (!isAppAsset(asset.folder)) continue;
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