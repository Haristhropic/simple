import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const [heroBanners, featuredProducts, galleryImages, aboutSections] = await Promise.all([
    prisma.heroBanner.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { featured: true, status: "published" },
      include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" }, take: 4 }),
    prisma.aboutSection.findMany({ where: { active: true } }),
  ]);

  const hero = heroBanners[0];
  const about = aboutSections[0];

  return (
    <>
      <section className="relative grid min-h-[90dvh] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 lg:px-12">
          <span className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {hero?.subtitle || "Spring Summer 2026"}
          </span>
          <h1 className="max-w-lg text-4xl font-medium leading-none tracking-tighter sm:text-5xl lg:text-6xl">
            {hero?.title || "Refined Essentials"}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {hero?.description || "A curated collection of timeless pieces, crafted with precision and designed to endure."}
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href={hero?.ctaLink || "/products"}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              {hero?.cta || "Explore Collection"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[50vh] lg:min-h-full">
          <Image
            src={hero?.imageUrl || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop"}
            alt="Editorial fashion photography"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Featured</span>
              <h2 className="mt-2 text-2xl font-medium tracking-tighter sm:text-3xl">Selected Pieces</h2>
            </div>
            <Link href="/products" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
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
                <span className="text-xs text-muted-foreground">{product.category.name}</span>
                <h3 className="mt-1 text-sm font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.price ? `$ ${Number(product.price).toLocaleString()}` : ""}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {about && (
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[50vh] lg:min-h-[70vh]">
              <Image
                src={about.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop"}
                alt={about.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-20 lg:px-16">
              <span className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">About</span>
              <h2 className="max-w-md text-2xl font-medium leading-tight tracking-tighter sm:text-3xl lg:text-4xl">
                {about.title}
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                {about.description}
              </p>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
                Read Our Story
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Editorial</span>
            <h2 className="mt-2 text-2xl font-medium tracking-tighter sm:text-3xl">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {galleryImages.map((img) => (
              <Link key={img.id} href="/gallery" className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-medium">
              View Full Gallery
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
