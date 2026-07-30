import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
  return <GalleryGrid images={images} />;
}
