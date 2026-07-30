"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteImage } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createGalleryImage(data: {
  url: string;
  publicId?: string;
  alt: string;
  order?: number;
}) {
  await requireAdmin();
  return prisma.galleryImage.create({ data: { ...data, order: data.order ?? 0 } });
}

export async function updateGalleryImage(
  id: string,
  data: { url?: string; publicId?: string; alt?: string; order?: number }
) {
  await requireAdmin();
  const image = await prisma.galleryImage.update({ where: { id }, data });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return image;
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) throw new Error("Image not found");
  if (image.publicId) {
    await deleteImage(image.publicId).catch((e) => console.error("Failed to delete Cloudinary image:", e));
  }
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function reorderGalleryImages(items: { id: string; order: number }[]) {
  await requireAdmin();
  for (const item of items) {
    await prisma.galleryImage.update({ where: { id: item.id }, data: { order: item.order } });
  }
  revalidatePath("/admin/gallery");
}
