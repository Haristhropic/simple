"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function SelectionToolbar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky top-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BulkActionButton({
  onClick,
  disabled,
  children,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        tone === "danger"
          ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          : "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}
