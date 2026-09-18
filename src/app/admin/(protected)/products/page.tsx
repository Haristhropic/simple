import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductsTable } from "./products-table";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price ? Number(product.price) : null,
    status: product.status,
    featured: product.featured,
    categoryName: product.category.name,
    imageUrl: product.images[0]?.url ?? null,
  }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ProductsTable products={rows} />
    </div>
  );
}
