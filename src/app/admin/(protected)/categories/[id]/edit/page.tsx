import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryEditForm } from "./category-edit-form";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  return <CategoryEditForm category={category} />;
}
