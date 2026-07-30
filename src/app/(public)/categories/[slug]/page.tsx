import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category Not Found" };
  return { title: category.name, description: `Browse our ${category.name.toLowerCase()} collection.` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "published" },
        include: { images: { take: 1, orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <Link
        href="/categories"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Categories
      </Link>

      <div className="relative mb-12 aspect-[21/9] overflow-hidden rounded-xl bg-zinc-100">
        {category.imageUrl ? (
          <Image src={category.imageUrl} alt={category.name} fill className="object-cover" priority sizes="100vw" />
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-8">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            {category.description || "Category"}
          </span>
          <h1 className="mt-2 text-3xl font-medium tracking-tighter text-white sm:text-4xl">
            {category.name}
          </h1>
        </div>
      </div>

      {category.products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pieces in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {category.products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-zinc-100">
                <Image
                  src={product.images[0]?.url || `https://picsum.photos/seed/${product.slug}/600/800`}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <h2 className="text-sm font-medium">{product.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.price ? `$ ${Number(product.price).toLocaleString()}` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
