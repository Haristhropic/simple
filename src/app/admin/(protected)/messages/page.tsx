import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = { title: "Messages" };

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <MessagesClient messages={messages} />;
}
