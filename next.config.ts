import type { NextConfig } from "next";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    BETTER_AUTH_URL: appUrl,
  },
};

export default nextConfig;
