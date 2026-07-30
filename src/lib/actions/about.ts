"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { aboutSectionSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createAboutSection(data: unknown) {
  await requireAdmin();
  const parsed = aboutSectionSchema.parse(data);
  return prisma.aboutSection.create({ data: parsed });
}

export async function updateAboutSection(id: string, data: unknown) {
  await requireAdmin();
  const parsed = aboutSectionSchema.partial().parse(data);
  const section = await prisma.aboutSection.update({ where: { id }, data: parsed });
  revalidatePath("/admin/about");
  revalidatePath("/about");
  return section;
}

export async function deleteAboutSection(id: string) {
  await requireAdmin();
  const section = await prisma.aboutSection.findUnique({ where: { id }, select: { imagePublicId: true } });
  if (section?.imagePublicId) {
    await deleteImage(section.imagePublicId).catch((e) => console.error("Failed to delete Cloudinary image:", e));
  }
  await prisma.aboutSection.delete({ where: { id } });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}
