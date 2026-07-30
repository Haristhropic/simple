import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductForm } from "../../_components/product-form";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <ProductForm categories={categories} />;
}
