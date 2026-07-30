"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createAboutSection, updateAboutSection, deleteAboutSection } from "@/lib/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { AboutSection } from "@/generated/prisma/client";

export function AboutForm({ sections: initial }: { sections: AboutSection[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploads, setUploads] = useState<Record<string, { url: string; publicId: string }>>({});

  function setUpload(id: string, result: { url: string; publicId: string }) {
    setUploads((prev) => ({ ...prev, [id]: result }));
  }

  async function save(id: string, form: FormData) {
    setLoading(id);
    setError("");
    setSuccess("");
    try {
      const upload = uploads[id];
      await updateAboutSection(id, {
        title: form.get("title") as string,
        description: form.get("description") as string,
        imageUrl: upload?.url || (form.get("imageUrl") as string) || null,
        imagePublicId: upload?.publicId || (form.get("imagePublicId") as string) || null,
        active: form.has("active"),
      });
      setUploads((prev) => { const rest = { ...prev }; delete rest[id]; return rest; });
      setSuccess("Section saved successfully.");
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
      await deleteAboutSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Section deleted successfully.");
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
      const result = await createAboutSection({
        title: "New Section",
        description: "Description here",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop",
        active: true,
      });
      if (result && "id" in result) {
        setSections((prev) => [...prev, result as AboutSection]);
        setSuccess("New section added successfully.");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tighter">About Section</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the about page content.</p>
        </div>
        <button onClick={addNew} disabled={loading === "new"} className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
          {loading === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Section
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">{success}</div>
      )}

      <div className="space-y-6">
        {sections.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No about sections yet.</p>
        )}
        {sections.map((section) => {
          const upload = uploads[section.id];
          return (
            <form
              key={section.id}
              onSubmit={(e) => { e.preventDefault(); save(section.id, new FormData(e.currentTarget)); }}
              className="rounded-xl border border-border p-6"
            >
<input type="hidden" name="imageUrl" value={upload?.url || section.imageUrl || ""} />
<input type="hidden" name="imagePublicId" value={upload?.publicId || section.imagePublicId || ""} />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" type="text" defaultValue={section.title} required className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea name="description" rows={6} defaultValue={section.description} required className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image</label>
                  <ImageUploader
                    onUpload={(result) => setUpload(section.id, result)}
                    currentUrl={upload?.url || section.imageUrl}
                    folder="maison/about"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked={section.active} className="rounded border-input" />
                  <span className="text-sm">Active</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={loading === section.id} className="inline-flex h-9 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
                    {loading === section.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </button>
                  <button type="button" onClick={() => remove(section.id)} className="text-sm text-red-500 hover:text-red-600">
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
