"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { bulkDeleteContactMessages, deleteContactMessage } from "@/lib/actions";
import { useSelection } from "@/components/admin/use-selection";
import { SelectionToolbar, BulkActionButton } from "@/components/admin/selection-toolbar";

export function MessagesClient({
  messages: initial,
}: {
  messages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    createdAt: Date;
  }>;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const { selected, isSelected, toggle, toggleAll, clear } = useSelection();

  const allIds = messages.map((m) => m.id);
  const allSelected = messages.length > 0 && selected.length === messages.length;

  async function remove(id: string) {
    setLoading(id);
    setError("");
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
    setLoading(null);
  }

  async function handleBulkDelete() {
    const ids = selected;
    setBusy(true);
    setError("");
    setActionMessage("");
    try {
      await bulkDeleteContactMessages(ids);
      setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
      setActionMessage(`${ids.length} message${ids.length > 1 ? "s" : ""} deleted.`);
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
          <h1 className="text-2xl font-medium tracking-tighter">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Contact form submissions.</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => toggleAll(allIds)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-600">
          {actionMessage}
        </div>
      )}

      <SelectionToolbar count={selected.length} onClear={clear}>
        <BulkActionButton onClick={handleBulkDelete} disabled={busy} tone="danger">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Delete
        </BulkActionButton>
      </SelectionToolbar>

      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-6 transition-colors ${
                isSelected(msg.id) ? "border-foreground" : "border-border"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select message from ${msg.name}`}
                    checked={isSelected(msg.id)}
                    onChange={() => toggle(msg.id)}
                    className="mt-1 size-4 shrink-0 rounded-[4px] border border-border bg-background"
                  />
                  <div>
                    <p className="font-medium">{msg.name}</p>
                    <p className="text-sm text-muted-foreground">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {msg.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => remove(msg.id)}
                    disabled={loading === msg.id}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete message"
                  >
                    {loading === msg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {msg.subject && (
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Subject: {msg.subject}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
