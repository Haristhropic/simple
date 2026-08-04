import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listFolders, listImages } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const max = Math.min(Number(searchParams.get("max")) || 60, 100);

  try {
    const [images, folders] = await Promise.all([
      listImages({ folder, cursor, max }),
      listFolders(),
    ]);

    return NextResponse.json({
      assets: images.assets,
      nextCursor: images.nextCursor,
      folders,
    });
  } catch (error) {
    console.error("List media error:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}
