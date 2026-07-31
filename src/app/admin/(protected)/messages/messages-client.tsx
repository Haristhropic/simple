"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteContactMessage } from "@/lib/actions";

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
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact form submissions.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-border p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium">{msg.name}</p>
                  <p className="text-sm text-muted-foreground">{msg.email}</p>
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
