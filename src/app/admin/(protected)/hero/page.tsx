import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { HeroForm } from "./hero-form";

export const metadata: Metadata = { title: "Hero Banner" };

export default async function AdminHeroPage() {
  const banners = await prisma.heroBanner.findMany({ orderBy: { order: "asc" } });
  return <HeroForm banners={banners} />;
}
