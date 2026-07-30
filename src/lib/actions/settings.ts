"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settingSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export async function upsertSetting(data: unknown) {
  await requireAdmin();
  const parsed = settingSchema.parse(data);
  const setting = await prisma.setting.upsert({
    where: { key: parsed.key },
    update: { value: parsed.value },
    create: parsed,
  });
  revalidatePath("/admin/settings");
  return setting;
}

export async function deleteSetting(key: string) {
  await requireAdmin();
  await prisma.setting.delete({ where: { key } });
  revalidatePath("/admin/settings");
}
