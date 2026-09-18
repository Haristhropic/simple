"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: Crumb[];
  className?: string;
}

const LABELS: Record<string, string> = {
  products: "Collection",
  categories: "Categories",
  about: "About",
  gallery: "Gallery",
  contact: "Contact",
  search: "Search",
  privacy: "Privacy",
  terms: "Terms",
  admin: "Admin",
  hero: "Hero",
  media: "Media",
  messages: "Messages",
  profile: "Profile",
  settings: "Settings",
};

const ADMIN_LABELS: Record<string, string> = {
  products: "Products",
  categories: "Categories",
  hero: "Hero",
  gallery: "Gallery",
  about: "About",
  media: "Media",
  messages: "Messages",
  settings: "Settings",
  profile: "Profile",
};

function prettify(segment: string, parent?: string): string {
  if (parent === "admin" && ADMIN_LABELS[segment]) return ADMIN_LABELS[segment];
  if (LABELS[segment]) return LABELS[segment];
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  if (!items && (pathname === "/" || pathname === "/admin")) return null;

  const crumbs: Crumb[] =
    items ??
    (() => {
      const segments = pathname.split("/").filter(Boolean);
      const built: Crumb[] = [{ label: "Home", href: "/" }];
      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        built.push({
          label: prettify(segment, segments[index - 1]),
          href: isLast
            ? undefined
            : `/${segments.slice(0, index + 1).join("/")}`,
        });
      });
      return built;
    })();

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`pt-6 ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-sm tracking-wide text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-xs opacity-40">
                  ›
                </span>
              )}
              {isLast || !crumb.href ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="relative transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-[-2px] after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-200 hover:text-foreground hover:after:scale-x-100"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
