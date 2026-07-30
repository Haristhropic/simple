"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateCategory, deleteCategory } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Category } from "@/generated/prisma/client";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slug, setSlug] = useState(category.slug);
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
    setSuccess("");

    try {
      const form = new FormData(e.currentTarget);
      const result = await updateCategory(category.id, {
        name: form.get("name") as string,
        slug: form.get("slug") as string,
        description: (form.get("description") as string) || null,
        imageUrl: upload?.url || category.imageUrl || null,
      });

      if (result && "id" in result) {
        setSuccess("Category updated successfully.");
        toast.success("Category updated");
        router.refresh();
      } else {
        setError("Failed to update category");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      if (message.includes("Unique constraint")) {
        setError("A category with this slug already exists.");
      } else {
        setError(message);
      }
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this category?")) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      toast.success("Category deleted");
      startTransition(() => router.push("/admin/categories"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <Link href="/admin/categories" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Categories
        </Link>
        <h1 className="mt-4 text-2xl font-medium tracking-tighter">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{success}</div>}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" type="text" required defaultValue={category.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input id="slug" name="slug" type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={category.description ?? ""} className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Image</label>
          <ImageUploader
            onUpload={(result) => setUpload(result)}
            currentUrl={upload?.url || category.imageUrl}
            folder="maison/categories"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </button>
          <button type="button" disabled={deleting} onClick={handleDelete} className="text-sm text-red-500 transition-colors hover:text-red-600">
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <Link href="/admin/categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
