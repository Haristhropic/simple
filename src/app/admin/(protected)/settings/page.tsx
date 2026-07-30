import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return <SettingsForm settings={map} />;
}
