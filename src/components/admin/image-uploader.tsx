"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

type Props = {
  onUpload: (result: { url: string; publicId: string }) => void;
  currentUrl?: string | null;
  folder?: string;
};

export function ImageUploader({ onUpload, currentUrl, folder = "maison" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPreview(data.url);
      onUpload({ url: data.url, publicId: data.publicId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function clear() {
    setPreview(null);
    onUpload({ url: "", publicId: "" });
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border px-4 py-8 transition-colors hover:border-muted-foreground"
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        ) : preview ? (
          <div className="relative w-full">
            <Image src={preview} alt="Preview" width={400} height={300} className="mx-auto max-h-48 w-auto rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow-sm ring-1 ring-border"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click or drop an image</p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
