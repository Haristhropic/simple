import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Error 404
      </span>
      <h1 className="mt-4 text-4xl font-light tracking-tighter sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-all hover:opacity-90"
      >
        Back Home
      </Link>
    </div>
  );
}
