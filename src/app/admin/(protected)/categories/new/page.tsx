"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createCategory } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");
  const [upload, setUpload] = useState<{ url: string; publicId: string } | null>(null);

  function handleNameChange(value: string) {
    if (!slug || slug === slugify(slug)) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const result = await createCategory({
        name: form.get("name") as string,
        slug: form.get("slug") as string,
        description: (form.get("description") as string) || null,
        imageUrl: upload?.url || null,
      });

      if (result && "id" in result) {
        window.location.href = "/admin/categories";
      } else {
        setError("Failed to create category");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <Link href="/admin/categories" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Categories
        </Link>
        <h1 className="mt-4 text-2xl font-medium tracking-tighter">New Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new product category.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" type="text" required onChange={(e) => handleNameChange(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="Category name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input id="slug" name="slug" type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="category-slug" />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={3} className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="Brief description" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Image</label>
          <ImageUploader onUpload={(result) => setUpload(result)} folder="maison/categories" />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Category"}
          </button>
          <Link href="/admin/categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
