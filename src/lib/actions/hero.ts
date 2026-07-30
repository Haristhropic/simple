"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { heroBannerSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createHeroBanner(data: unknown) {
  await requireAdmin();
  const parsed = heroBannerSchema.parse(data);
  return prisma.heroBanner.create({ data: parsed });
}

export async function updateHeroBanner(id: string, data: unknown) {
  await requireAdmin();
  const parsed = heroBannerSchema.partial().parse(data);
  const banner = await prisma.heroBanner.update({ where: { id }, data: parsed });
  revalidatePath("/admin/hero");
  revalidatePath("/");
  return banner;
}

export async function deleteHeroBanner(id: string) {
  await requireAdmin();
  const banner = await prisma.heroBanner.findUnique({ where: { id }, select: { imagePublicId: true } });
  if (banner?.imagePublicId) {
    await deleteImage(banner.imagePublicId).catch((e) => console.error("Failed to delete Cloudinary image:", e));
  }
  await prisma.heroBanner.delete({ where: { id } });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function reorderHeroBanners(items: { id: string; order: number }[]) {
  await requireAdmin();
  for (const item of items) {
    await prisma.heroBanner.update({ where: { id: item.id }, data: { order: item.order } });
  }
  revalidatePath("/admin/hero");
  revalidatePath("/");
}
