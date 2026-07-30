import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = checkRateLimit(`revalidate:${session.user.id}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { path, paths } = await request.json();

    if (paths && Array.isArray(paths)) {
      paths.forEach((p: string) => revalidatePath(p));
    } else if (path) {
      revalidatePath(path);
    } else {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
