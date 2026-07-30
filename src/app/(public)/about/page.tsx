import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Maison — our story, craft, and philosophy.",
};

export default async function AboutPage() {
  const sections = await prisma.aboutSection.findMany({
    where: { active: true },
  });

  const section = sections[0];

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
            <Image
              src={section?.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop"}
              alt={section?.title || "Maison studio"}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col justify-center">
            {section ? (
              <>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  About
                </span>
                <h1 className="mt-3 text-3xl font-medium tracking-tighter sm:text-4xl lg:text-5xl">
                  {section.title}
                </h1>
                <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
                  {section.description.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">About section coming soon.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
