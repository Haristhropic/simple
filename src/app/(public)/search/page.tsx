import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Find pieces in our collection.",
};

export default async function SearchPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const q = (await props.searchParams)?.q || "";

  const products = await prisma.product.findMany({
    where: {
      status: "published",
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = products.map((p) => ({
    ...p,
    price: p.price ? Number(p.price) : null,
  }));

  return <SearchClient products={serialized} initialQuery={q} />;
}
