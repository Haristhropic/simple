import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function getCategories(include?: { productCount?: boolean }) {
  const query: Prisma.CategoryFindManyArgs = {
    orderBy: { name: "asc" },
  };
  if (include?.productCount) {
    query.include = { _count: { select: { products: true } } };
  }
  return prisma.category.findMany(query);
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "published" },
        include: { images: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
