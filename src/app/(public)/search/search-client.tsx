"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  category: { name: string };
  images: { url: string }[];
};

export function SearchClient({ products, initialQuery }: { products: Product[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || "");

  const results = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-12">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Search
        </span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter sm:text-4xl">
          Find Pieces
        </h1>
      </div>

      <div className="relative mb-12 max-w-lg">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or category..."
          className="w-full rounded-full border border-input bg-background py-3 pl-11 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((product) => (
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
      )}
    </div>
  );
}
