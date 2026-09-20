import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoriesTable } from "./categories-table";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const rows = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    imageUrl: cat.imageUrl,
    productCount: cat._count.products,
  }));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your products by category.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <CategoriesTable categories={rows} />
    </div>
  );
}
