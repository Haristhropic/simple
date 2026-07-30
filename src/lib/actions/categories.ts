"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorySchema, categoryUpdateSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function createCategory(data: unknown) {
  await requireAdmin();
  const input = data as Record<string, unknown>;
  if (typeof input.slug === "string") {
    input.slug = input.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  const parsed = categorySchema.parse(input);
  return prisma.category.create({ data: parsed });
}

export async function updateCategory(id: string, data: unknown) {
  await requireAdmin();
  const parsed = categoryUpdateSchema.parse(data);
  const category = await prisma.category.update({ where: { id }, data: parsed });
  revalidatePath("/admin/categories");
  revalidatePath(`/categories/${category.slug}`);
  return category;
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Cannot delete category with ${productCount} linked product${productCount > 1 ? "s" : ""}. Remove or reassign the products first.`
    );
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}
