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
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product Not Found" };
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, status: "published" },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Collection
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
          <Image
            src={product.images[0]?.url || `https://picsum.photos/seed/${product.slug}/800/1000`}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {product.category.name}
          </span>
          <h1 className="mt-3 text-3xl font-medium tracking-tighter sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {product.price ? `$ ${Number(product.price).toLocaleString()}` : ""}
          </p>
          {product.description && (
            <div className="mt-8 border-t border-border pt-8">
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
