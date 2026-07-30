"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createProduct, updateProduct, updateProductImages, deleteProduct } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Category, ProductImage } from "@/generated/prisma/client";

type SerializableProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  featured: boolean;
  status: string;
  categoryId: string;
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Props = {
  categories: Pick<Category, "id" | "name">[];
  product?: SerializableProduct;
};

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [productImages, setProductImages] = useState<ProductImage[]>(product?.images ?? []);
  const isEdit = !!product;

  function handleNameChange(value: string) {
    if (isEdit) return;
    if (!slug || slug === slugify(slug)) {
      setSlug(slugify(value));
    }
  }

  function handleImageUpload(result: { url: string; publicId: string }) {
    setProductImages((prev) => [
      ...prev,
      { url: result.url, publicId: result.publicId, alt: null, order: prev.length, id: "", productId: product?.id ?? "", createdAt: new Date() } as ProductImage,
    ]);
  }

  function removeImage(index: number) {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;
    if (!product) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted");
      startTransition(() => router.push("/admin/products"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const data = {
        name: form.get("name") as string,
        slug: form.get("slug") as string,
        description: (form.get("description") as string) || null,
        price: form.get("price") ? Number(form.get("price")) : null,
        categoryId: form.get("categoryId") as string,
        featured: form.has("featured"),
        status: form.has("published") ? "published" : "draft",
      };

      const result = isEdit
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (result && "id" in result) {
        if (productImages.length > 0) {
          await updateProductImages(
            result.id,
            productImages.map((img, i) => ({
              url: img.url,
              publicId: img.publicId || "",
              alt: img.alt || undefined,
              order: i,
            }))
          );
        }
        setLoading(false);
        toast.success(isEdit ? "Product updated" : "Product created");
        startTransition(() => router.push("/admin/products"));
      } else {
        setError("Operation failed");
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      if (message.includes("Unique constraint") && message.includes("slug")) {
        setError("A product with this slug already exists. Change the name or edit the slug.");
      } else {
        setError(message);
      }
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <Link
          href="/admin/products"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
        <h1 className="mt-4 text-2xl font-medium tracking-tighter">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit ? "Update product details." : "Add a new piece to your catalog."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" name="name" type="text" required defaultValue={product?.name ?? ""} onChange={(e) => handleNameChange(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="Product name" />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <input id="slug" name="slug" type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="product-slug" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="Product description" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">Price</label>
            <input id="price" name="price" type="number" step="0.01" defaultValue={product?.price ? Number(product.price) : ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
            <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Images</label>
          <ImageUploader onUpload={handleImageUpload} folder="maison/products" />
          {productImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {productImages.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="100px" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-full bg-background p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="rounded border-input" />
            <span className="text-sm">Featured product</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={product?.status === "published" || !product} className="rounded border-input" />
            <span className="text-sm">Published</span>
          </label>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save Changes" : "Create Product"}
          </button>
          {isEdit && (
            <button type="button" disabled={deleting} onClick={handleDelete} className="text-sm text-red-500 transition-colors hover:text-red-600">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <Link href="/admin/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
