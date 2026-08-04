"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FolderOpen, HardDrive, ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";
import type { CloudinaryAsset } from "@/lib/cloudinary";

type MediaResponse = {
  assets: CloudinaryAsset[];
  nextCursor: string | null;
  folders: string[];
  error?: string;
};

const PAGE_SIZE = 60;

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("maison");

  const load = useCallback(
    async (reset: boolean, cursor?: string) => {
      if (reset) setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ max: String(PAGE_SIZE) });
        if (filter) params.set("folder", filter);
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/media?${params.toString()}`);
        const data = (await res.json()) as MediaResponse;
        if (!res.ok) throw new Error(data.error || "Failed to load media");

        setAssets((prev) => (reset ? data.assets : [...prev, ...data.assets]));
        setNextCursor(data.nextCursor);
        setFolders((prev) => (prev.length ? prev : data.folders));
        setUploadFolder((prev) => {
          if (prev && data.folders.includes(prev)) return prev;
          return data.folders.includes("maison") ? "maison" : data.folders[0] || "maison";
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media");
      }
      if (reset) setLoading(false);
      setLoadingMore(false);
    },
    [filter]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams({ max: String(PAGE_SIZE) });
      if (filter) params.set("folder", filter);
      try {
        const res = await fetch(`/api/media?${params.toString()}`);
        const data = (await res.json()) as MediaResponse;
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to load media");
        setAssets(data.assets);
        setNextCursor(data.nextCursor);
        setFolders((prev) => (prev.length ? prev : data.folders));
        setUploadFolder((prev) => {
          if (prev && data.folders.includes(prev)) return prev;
          return data.folders.includes("maison") ? "maison" : data.folders[0] || "maison";
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  function selectFilter(folder: string) {
    setFilter(folder);
    setLoading(true);
    setError("");
  }

  function loadMore() {
    setLoadingMore(true);
    load(false, nextCursor ?? undefined);
  }

  async function handleDelete(asset: CloudinaryAsset) {
    if (!confirm(`Delete this image?\n\n${asset.publicId}`)) return;
    setDeleting(asset.publicId);
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: asset.publicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setAssets((prev) => prev.filter((a) => a.publicId !== asset.publicId));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleting(null);
  }

  async function handleUpload() {
    setShowUploader(false);
    await load(true);
  }

  function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">Media Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse every image stored in Cloudinary.</p>
        </div>
        <button
          onClick={() => setShowUploader((v) => !v)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
        >
          {showUploader ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showUploader ? "Close" : "Upload"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}

      {showUploader && (
        <div className="max-w-sm space-y-3 rounded-xl border border-border p-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" />
              Upload to folder
            </label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-muted-foreground"
            >
              {folders.length === 0 && <option value="maison">maison</option>}
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder || "/"}
                </option>
              ))}
            </select>
          </div>
          <ImageUploader onUpload={handleUpload} folder={uploadFolder} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => selectFilter("")}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors",
            filter === ""
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          All
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => selectFilter(folder)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors",
              filter === folder
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {folder}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-20">
          <div className="text-center">
            <HardDrive className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              {filter ? `No images in "${filter}"` : "No images in your Cloudinary yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images using the uploader above, or via the gallery, products, hero and about pages.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {assets.map((img) => (
              <div key={img.publicId} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                <Image src={img.url} alt={img.publicId} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-0 transition-all group-hover:opacity-100">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">
                      {img.folder || "/"}
                    </p>
                    <p className="text-[10px] text-white/70">
                      {formatBytes(img.bytes)} · {img.width && img.height ? `${img.width}×${img.height}` : img.format}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deleting === img.publicId}
                    className="shrink-0 rounded-full bg-white/90 p-1.5 text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                    title="Delete image"
                  >
                    {deleting === img.publicId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
