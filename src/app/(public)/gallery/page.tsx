import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Editorial fashion photography gallery.",
};

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-12">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Editorial
        </span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter sm:text-4xl">
          Gallery
        </h1>
      </div>

      {images.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">Gallery coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden bg-zinc-100 ${i % 4 === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
              style={{ aspectRatio: i % 4 === 0 ? "auto" : "3/4" }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={800}
                height={1000}
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
