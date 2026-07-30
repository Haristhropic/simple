"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";

export default function AdminMediaPage() {
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);

  function handleUpload(result: { url: string; publicId: string }) {
    setImages((prev) => [...prev, result]);
  }

  async function remove(index: number) {
    const img = images[index];
    if (img?.publicId) {
      try {
        await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId: img.publicId }) });
      } catch {}
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">Media Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and manage all uploaded images.</p>
        </div>
      </div>

      <div className="max-w-sm">
        <ImageUploader onUpload={handleUpload} />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
              <Image src={img.url} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                <button onClick={() => remove(i)} className="rounded-full bg-background px-3 py-1 text-xs font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-medium">Upload images using the uploader above</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
