import { prisma } from "@/lib/db";

export async function getHeroBanners(activeOnly = false) {
  return prisma.heroBanner.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
  });
}

export async function getHeroBannerById(id: string) {
  return prisma.heroBanner.findUnique({ where: { id } });
}
