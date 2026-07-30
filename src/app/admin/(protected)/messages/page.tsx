import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Messages" };

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium tracking-tighter">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact form submissions.</p>
      </div>

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
                <span className="text-xs text-muted-foreground">
                  {msg.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
