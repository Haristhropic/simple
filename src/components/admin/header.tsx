"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminSidebarMobile } from "./sidebar-mobile";

export function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center border-b border-border bg-background px-6 lg:px-10">
        <button
          className="mr-4 text-muted-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/admin" className="text-sm font-medium tracking-tight lg:hidden">
          MAISON / ADMIN
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Admin</span>
        </div>
      </header>

      {mobileOpen && <AdminSidebarMobile onClose={() => setMobileOpen(false)} />}
    </>
  );
}
