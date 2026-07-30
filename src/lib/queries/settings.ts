import { prisma } from "@/lib/db";

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((s) => [s.key, s.value])) as Record<string, string>;
}

export async function getSetting(key: string) {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value ?? null;
}
