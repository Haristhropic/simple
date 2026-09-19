"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { bulkDeleteHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { useSelection } from "@/components/admin/use-selection";
import { SelectionToolbar, BulkActionButton } from "@/components/admin/selection-toolbar";
import type { HeroBanner } from "@/generated/prisma/client";

export function HeroForm({ banners: initial }: { banners: HeroBanner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploads, setUploads] = useState<Record<string, { url: string; publicId: string }>>({});
  const { selected, isSelected, toggle, toggleAll, clear } = useSelection();

  const allIds = banners.map((b) => b.id);
  const allSelected = banners.length > 0 && selected.length === banners.length;

  function setUpload(id: string, result: { url: string; publicId: string }) {
    setUploads((prev) => ({ ...prev, [id]: result }));
  }

  async function save(id: string, form: FormData) {
    setLoading(id);
    setError("");
    setSuccess("");
    try {
      const upload = uploads[id];
      await updateHeroBanner(id, {
        title: form.get("title") as string,
        subtitle: (form.get("subtitle") as string) || null,
        description: (form.get("description") as string) || null,
        cta: (form.get("cta") as string) || null,
        ctaLink: (form.get("ctaLink") as string) || null,
        imageUrl: upload?.url || form.get("imageUrl")?.toString() || "",
        imagePublicId: upload?.publicId || (form.get("imagePublicId") as string) || null,
        active: form.has("active"),
        order: Number(form.get("order")) || 0,
      });
      setUploads((prev) => { const rest = { ...prev }; delete rest[id]; return rest; });
      setSuccess("Banner saved successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setLoading(null);
  }

  async function remove(id: string) {
    setLoading(id);
    setError("");
    setSuccess("");
    try {
      await deleteHeroBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setSuccess("Banner deleted successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
    setLoading(null);
  }

  async function addNew() {
    setLoading("new");
    setError("");
    setSuccess("");
    try {
      const result = await createHeroBanner({
        title: "New Banner",
        subtitle: "Subtitle",
        description: "A curated collection of timeless pieces, crafted with precision and designed to endure.",
        imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=1600&fit=crop",
        active: true,
        order: banners.length,
      });
      if (result && "id" in result) {
        setBanners((prev) => [...prev, result as HeroBanner]);
        setSuccess("New banner added successfully.");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
    setLoading(null);
  }

  async function handleBulkDelete() {
    const ids = selected;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await bulkDeleteHeroBanners(ids);
      setBanners((prev) => prev.filter((b) => !ids.includes(b.id)));
      setSuccess(`${ids.length} banner${ids.length > 1 ? "s" : ""} deleted.`);
      clear();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">Hero Banner</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the homepage hero banners.</p>
        </div>
        <div className="flex items-center gap-4">
          {banners.length > 0 && (
            <button
              type="button"
              onClick={() => toggleAll(allIds)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {allSelected ? "Clear selection" : "Select all"}
            </button>
          )}
          <button onClick={addNew} disabled={loading === "new"} className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
            {loading === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Banner
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{success}</div>
      )}

      <SelectionToolbar count={selected.length} onClear={clear}>
        <BulkActionButton onClick={handleBulkDelete} disabled={busy} tone="danger">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Delete
        </BulkActionButton>
      </SelectionToolbar>

      <div className="space-y-6">
        {banners.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No hero banners yet. Add one to get started.</p>
        )}
        {banners.map((banner) => {
          const upload = uploads[banner.id];
          return (
            <form
              key={banner.id}
              onSubmit={(e) => { e.preventDefault(); save(banner.id, new FormData(e.currentTarget)); }}
              className={`rounded-xl border p-6 transition-colors ${
                isSelected(banner.id) ? "border-foreground" : "border-border"
              }`}
            >
              <input type="hidden" name="order" value={banner.order} />
              <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  aria-label={`Select ${banner.title}`}
                  checked={isSelected(banner.id)}
                  onChange={() => toggle(banner.id)}
                  className="size-4 shrink-0 rounded-[4px] border border-border bg-background"
                />
                Select
              </label>
              <input type="hidden" name="imageUrl" value={upload?.url || banner.imageUrl} />
              <input type="hidden" name="imagePublicId" value={upload?.publicId || banner.imagePublicId || ""} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" type="text" defaultValue={banner.title} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle</label>
                  <input name="subtitle" type="text" defaultValue={banner.subtitle ?? ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Text</label>
                  <input name="cta" type="text" defaultValue={banner.cta ?? ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea name="description" rows={3} defaultValue={banner.description ?? "A curated collection of timeless pieces, crafted with precision and designed to endure."} className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Image</label>
                  <ImageUploader
                    onUpload={(result) => setUpload(banner.id, result)}
                    currentUrl={upload?.url || banner.imageUrl}
                    folder="maison/hero"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked={banner.active} className="size-4 shrink-0 rounded-[4px] border border-border bg-background" />
                  <span className="text-sm">Active</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={loading === banner.id} className="inline-flex h-9 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
                    {loading === banner.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </button>
                  <button type="button" onClick={() => remove(banner.id)} className="text-sm text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
