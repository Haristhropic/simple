import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "../../../_components/product-form";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const serialized = {
    ...product,
    price: product.price ? Number(product.price) : null,
    images: product.images.map((img) => ({ ...img })),
  };

  return <ProductForm categories={categories} product={serialized} />;
}
