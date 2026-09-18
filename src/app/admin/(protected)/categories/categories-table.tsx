"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { bulkDeleteCategories } from "@/lib/actions";
import { useSelection } from "@/components/admin/use-selection";
import { SelectionToolbar, BulkActionButton } from "@/components/admin/selection-toolbar";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
};

export function CategoriesTable({ categories: initial }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { selected, isSelected, toggle, toggleAll, clear } = useSelection();

  const allIds = categories.map((c) => c.id);
  const allSelected = categories.length > 0 && selected.length === categories.length;

  async function handleDelete() {
    const ids = selected;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await bulkDeleteCategories(ids);
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
      setMessage(`${ids.length} categor${ids.length > 1 ? "ies" : "y"} deleted.`);
      clear();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed");
    }
    setBusy(false);
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
                  aria-label="Select all categories"
                  checked={allSelected}
                  onChange={() => toggleAll(allIds)}
                  className="rounded border-input"
                />
              </th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Image</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Products</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No categories yet.{" "}
                  <Link href="/admin/categories/new" className="underline hover:text-foreground">
                    Create your first category
                  </Link>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className={`border-b border-border last:border-0 ${isSelected(cat.id) ? "bg-muted/50" : ""}`}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${cat.name}`}
                      checked={isSelected(cat.id)}
                      onChange={() => toggle(cat.id)}
                      className="rounded border-input"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100">
                      {cat.imageUrl ? (
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-300">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{cat.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{cat.slug}</td>
                  <td className="px-5 py-3 text-muted-foreground">{cat.productCount}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
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
