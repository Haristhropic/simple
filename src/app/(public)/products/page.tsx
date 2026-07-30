import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Collection",
  description: "Browse our full collection of curated fashion pieces.",
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-12">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Collection
        </span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter sm:text-4xl">
          All Pieces
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-zinc-100">
              <Image
                src={product.images[0]?.url || `https://picsum.photos/seed/${product.slug}/600/800`}
                alt={product.name}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <span className="text-xs text-muted-foreground">{product.category.name}</span>
            <h2 className="mt-1 text-sm font-medium">{product.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.price ? `$ ${Number(product.price).toLocaleString()}` : ""}
            </p>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No pieces in the collection yet.
        </p>
      )}
    </div>
  );
}
