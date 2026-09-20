"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { bulkDeleteGalleryImages, createGalleryImage, deleteGalleryImage } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { useSelection } from "@/components/admin/use-selection";
import { SelectionToolbar, BulkActionButton } from "@/components/admin/selection-toolbar";
import type { GalleryImage } from "@/generated/prisma/client";

export function GalleryGrid({ images: initial }: { images: GalleryImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const { selected, isSelected, toggle, toggleAll, clear } = useSelection();

  const allIds = images.map((img) => img.id);
  const allSelected = images.length > 0 && selected.length === images.length;

  async function remove(id: string) {
    setLoading(id);
    setError("");
    try {
      await deleteGalleryImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
    setLoading(null);
  }

  async function handleUpload(result: { url: string; publicId: string }) {
    setLoading("add");
    setError("");
    try {
      const created = await createGalleryImage({ url: result.url, publicId: result.publicId, alt: "Gallery image", order: images.length });
      if (created) setImages((prev) => [...prev, created as GalleryImage]);
      setShowUploader(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
    setLoading(null);
  }

  async function handleBulkDelete() {
    const ids = selected;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await bulkDeleteGalleryImages(ids);
      setImages((prev) => prev.filter((img) => !ids.includes(img.id)));
      setMessage(`${ids.length} image${ids.length > 1 ? "s" : ""} deleted.`);
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
          <h1 className="text-2xl font-medium tracking-tighter">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage editorial gallery images.</p>
        </div>
        <div className="flex items-center gap-4">
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => toggleAll(allIds)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {allSelected ? "Clear selection" : "Select all"}
            </button>
          )}
          <button onClick={() => setShowUploader(!showUploader)} disabled={loading === "add"} className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
            {loading === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Image
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{message}</div>
      )}

      <SelectionToolbar count={selected.length} onClear={clear}>
        <BulkActionButton onClick={handleBulkDelete} disabled={busy} tone="danger">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Delete
        </BulkActionButton>
      </SelectionToolbar>

      {showUploader && (
        <div className="max-w-sm">
          <ImageUploader onUpload={handleUpload} folder="maison/gallery" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.length === 0 && !showUploader && (
          <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No gallery images yet.
          </div>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            className={`group relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 ring-2 transition-all ${
              isSelected(img.id) ? "ring-foreground" : "ring-transparent"
            }`}
          >
            <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            <label className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-background/90 shadow-sm">
              <input
                type="checkbox"
                aria-label={`Select ${img.alt}`}
                checked={isSelected(img.id)}
                onChange={() => toggle(img.id)}
                className="size-4 shrink-0 rounded-[4px] border border-border bg-background"
              />
            </label>
            <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-3 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
              <button onClick={() => remove(img.id)} disabled={loading === img.id} className="rounded-full bg-background px-3 py-1.5 text-xs font-medium">
                {loading === img.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
