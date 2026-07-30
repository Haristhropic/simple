import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AboutForm } from "./about-form";

export const metadata: Metadata = { title: "About Section" };

export default async function AdminAboutPage() {
  const sections = await prisma.aboutSection.findMany();
  return <AboutForm sections={sections} />;
}
