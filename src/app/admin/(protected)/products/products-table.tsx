"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  bulkDeleteProducts,
  bulkSetProductFeatured,
  bulkUpdateProductStatus,
} from "@/lib/actions";
import { useSelection } from "@/components/admin/use-selection";
import { SelectionToolbar, BulkActionButton } from "@/components/admin/selection-toolbar";

export type ProductRow = {
  id: string;
  name: string;
  price: number | null;
  status: string;
  featured: boolean;
  categoryName: string;
  imageUrl: string | null;
};

export function ProductsTable({ products: initial }: { products: ProductRow[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { selected, isSelected, toggle, toggleAll, clear } = useSelection();

  const allIds = products.map((p) => p.id);
  const allSelected = products.length > 0 && selected.length === products.length;

  async function run(action: () => Promise<void>, successMsg: string, onSuccess?: () => void) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      onSuccess?.();
      setMessage(successMsg);
      clear();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed");
    }
    setBusy(false);
  }

  function handleDelete() {
    const ids = selected;
    run(
      () => bulkDeleteProducts(ids),
      `${ids.length} product${ids.length > 1 ? "s" : ""} deleted.`,
      () => setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
    );
  }

  function handleStatus(status: string) {
    const ids = selected;
    run(
      () => bulkUpdateProductStatus(ids, status),
      `${ids.length} product${ids.length > 1 ? "s" : ""} marked ${status}.`,
      () => setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)))
    );
  }

  function handleFeatured(featured: boolean) {
    const ids = selected;
    run(
      () => bulkSetProductFeatured(ids, featured),
      `${ids.length} product${ids.length > 1 ? "s" : ""} ${featured ? "featured" : "unfeatured"}.`,
      () => setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, featured } : p)))
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{message}</div>
      )}

      <SelectionToolbar count={selected.length} onClear={clear}>
        <BulkActionButton onClick={() => handleStatus("published")} disabled={busy}>Publish</BulkActionButton>
        <BulkActionButton onClick={() => handleStatus("draft")} disabled={busy}>Unpublish</BulkActionButton>
        <BulkActionButton onClick={() => handleFeatured(true)} disabled={busy}>Feature</BulkActionButton>
        <BulkActionButton onClick={() => handleFeatured(false)} disabled={busy}>Unfeature</BulkActionButton>
        <BulkActionButton onClick={handleDelete} disabled={busy} tone="danger">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Delete
        </BulkActionButton>
      </SelectionToolbar>

      <div className="rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-5 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all products"
                  checked={allSelected}
                  onChange={() => toggleAll(allIds)}
                  className="size-4 shrink-0 rounded-[4px] border border-border bg-background"
                />
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Image</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="underline hover:text-foreground">
                    Add your first product
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b border-border last:border-0 ${isSelected(product.id) ? "bg-muted/50" : ""}`}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${product.name}`}
                      checked={isSelected(product.id)}
                      onChange={() => toggle(product.id)}
                      className="size-4 shrink-0 rounded-[4px] border border-border bg-background"
                    />
                  </td>
                  <td className="px-5 py-3">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-foreground/10"
                      />
                    ) : (
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {product.name}
                    {product.featured && (
                      <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{product.categoryName}</td>
                  <td className="px-5 py-3">{product.price ? `$${product.price.toLocaleString("en-US")}` : "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
