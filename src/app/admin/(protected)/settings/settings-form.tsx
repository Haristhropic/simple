"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { upsertSetting } from "@/lib/actions";

const fields = [
  { key: "siteName", label: "Site Name", type: "text" },
  { key: "siteDescription", label: "Site Description", type: "textarea" },
  { key: "contactEmail", label: "Contact Email", type: "email" },
  { key: "instagramUrl", label: "Instagram URL", type: "url" },
];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      for (const field of fields) {
        await upsertSetting({ key: field.key, value: (form.get(field.key) as string) || "" });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Website configuration.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label htmlFor={field.key} className="text-sm font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea id={field.key} name={field.key} rows={3} defaultValue={settings[field.key] ?? ""} className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
            ) : (
              <input id={field.key} name={field.key} type={field.type} defaultValue={settings[field.key] ?? ""} className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
            )}
          </div>
        ))}

        <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
