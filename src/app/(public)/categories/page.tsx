import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse fashion by category.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { status: "published" } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-12">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Browse</span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter sm:text-4xl">Categories</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group">
            <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-zinc-100">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-light text-zinc-300">
                  {cat.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-sm font-medium">{cat.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {cat._count.products} piece{cat._count.products !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">No categories yet.</p>
      )}
    </div>
  );
}
