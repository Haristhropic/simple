"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema, productUpdateSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createProduct(data: unknown) {
  await requireAdmin();
  const input = data as Record<string, unknown>;
  if (typeof input.slug === "string") {
    input.slug = input.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  const parsed = productSchema.parse(input);
  const product = await prisma.product.create({ data: parsed });
  return { ...product, price: product.price ? Number(product.price) : null };
}

export async function updateProduct(id: string, data: unknown) {
  await requireAdmin();
  const parsed = productUpdateSchema.parse(data);
  const product = await prisma.product.update({ where: { id }, data: parsed });
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  return { ...product, price: product.price ? Number(product.price) : null };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const images = await prisma.productImage.findMany({ where: { productId: id }, select: { publicId: true } });
  for (const img of images) {
    if (img.publicId) {
      await deleteImage(img.publicId).catch((e) => console.error("Failed to delete Cloudinary image:", e));
    }
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProductImages(
  productId: string,
  images: { url: string; publicId: string; alt?: string; order?: number }[]
) {
  await requireAdmin();
  const existing = await prisma.productImage.findMany({ where: { productId }, select: { publicId: true } });
  for (const img of existing) {
    if (img.publicId && !images.some((i) => i.publicId === img.publicId)) {
      await deleteImage(img.publicId).catch((e) => console.error("Failed to delete Cloudinary image:", e));
    }
  }
  await prisma.productImage.deleteMany({ where: { productId } });
  return prisma.productImage.createMany({
    data: images.map((img) => ({ ...img, productId, order: img.order ?? 0 })),
  });
}
