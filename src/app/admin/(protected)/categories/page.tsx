import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

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

      <div className="rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Image</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Products</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No categories yet.{' '}
                  <Link href="/admin/categories/new" className="underline hover:text-foreground">
                    Create your first category
                  </Link>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100">
                      {cat.imageUrl ? (
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-300">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{cat.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{cat.slug}</td>
                  <td className="px-5 py-3 text-muted-foreground">{cat._count.products}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
