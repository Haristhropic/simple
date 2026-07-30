import Link from "next/link";
import { getSetting } from "@/lib/queries/settings";

export async function Footer() {
  const instagramUrl = await getSetting("instagramUrl");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-medium tracking-tight">MAISON</h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Curated fashion catalog. Premium editorial presentation for the discerning.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/products", label: "Collection" },
                { href: "/categories", label: "Categories" },
                { href: "/about", label: "About" },
                { href: "/gallery", label: "Gallery" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Connect
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
              {instagramUrl && (
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Maison. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
