import { prisma } from "@/lib/db";

export async function getAboutSections(activeOnly = false) {
  return prisma.aboutSection.findMany({
    where: activeOnly ? { active: true } : undefined,
  });
}

export async function getAboutSectionById(id: string) {
  return prisma.aboutSection.findUnique({ where: { id } });
}
