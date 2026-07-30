import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  Images,
  FileText,
  Mail,
  Settings,
  HardDrive,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/hero", label: "Hero Banner", icon: Image },
  { href: "/admin/about", label: "About Section", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/media", label: "Media Manager", icon: HardDrive },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export function AdminSidebarMobile({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <nav className="relative w-64 bg-background p-3 pt-4">
        <div className="mb-4 px-3">
          <Link href="/admin" className="text-sm font-medium tracking-tight" onClick={onClose}>
            MAISON / ADMIN
          </Link>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <LogOut className="h-4 w-4" />
            Back to Site
          </Link>
        </div>
      </nav>
    </div>
  );
}
