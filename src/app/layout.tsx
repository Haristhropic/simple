import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Maison — Fashion Catalog",
    template: "%s — Maison",
  },
  description: "Discover our curated collection of fashion. Premium catalog with editorial presentation.",
  openGraph: {
    title: "Maison — Fashion Catalog",
    description: "Discover our curated collection of fashion.",
    url: "/",
    siteName: "Maison",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison — Fashion Catalog",
    description: "Discover our curated collection of fashion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
