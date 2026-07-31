"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contactMessageSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function sendContactMessage(data: unknown) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || headerStore.get("x-real-ip") || "unknown";
  const rateLimit = checkRateLimit(`contact:${ip}`);
  if (!rateLimit.allowed) {
    throw new Error("Too many requests. Please try again later.");
  }
  const parsed = contactMessageSchema.parse(data);
  await prisma.contactMessage.create({ data: parsed });
  return { success: true };
}

export async function getContactMessages() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteContactMessage(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  await prisma.contactMessage.delete({ where: { id } });
}
