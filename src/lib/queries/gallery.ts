import { prisma } from "@/lib/db";

export async function getGalleryImages() {
  return prisma.galleryImage.findMany({
    orderBy: { order: "asc" },
  });
}
