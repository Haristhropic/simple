import { prisma } from "@/lib/db";

export async function getProducts(params?: { featured?: boolean; status?: string; categoryId?: string }) {
  return prisma.product.findMany({
    where: {
      ...(params?.featured !== undefined && { featured: params.featured }),
      ...(params?.status && { status: params.status }),
      ...(params?.categoryId && { categoryId: params.categoryId }),
    },
    include: { images: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, status: "published" },
    include: { images: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}
