import { Package, FolderTree, Image, Images } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, heroCount, galleryCount, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.heroBanner.count(),
    prisma.galleryImage.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Products", value: String(productCount), icon: Package },
    { label: "Categories", value: String(categoryCount), icon: FolderTree },
    { label: "Hero Banners", value: String(heroCount), icon: Image },
    { label: "Gallery Images", value: String(galleryCount), icon: Images },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your catalog.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border p-5">
              <Icon className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-medium tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium">Recent Products</h2>
        <div className="rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No products yet.{' '}
                    <Link href="/admin/products/new" className="underline hover:text-foreground">
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {p.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
