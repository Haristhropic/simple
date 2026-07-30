import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

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

      <div className="rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No products yet.{' '}
                  <Link href="/admin/products/new" className="underline hover:text-foreground">
                    Add your first product
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{product.category.name}</td>
                  <td className="px-5 py-3">{product.price ? `$${Number(product.price).toLocaleString()}` : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
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
