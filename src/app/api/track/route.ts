import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { pageViewSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

function parseDevice(userAgent: string): string {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function hashVisitor(ip: string, userAgent: string): string {
  const salt = process.env.ANALYTICS_SALT || "maison-analytics-salt";
  return createHash("sha256").update(`${ip}|${userAgent}|${salt}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = checkRateLimit(`track:${ip}`, {
      windowMs: 60_000,
      maxRequests: 120,
    });
    if (!rateLimit.allowed) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await request.json();
    const parsed = pageViewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (parsed.data.path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }

    const userAgent = request.headers.get("user-agent") || "";

    await prisma.pageView.create({
      data: {
        path: parsed.data.path,
        referrer: parsed.data.referrer || null,
        device: parseDevice(userAgent),
        country: request.headers.get("x-vercel-ip-country") || null,
        visitorHash: hashVisitor(ip, userAgent),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Track error:", error);
    return new NextResponse(null, { status: 204 });
  }
}