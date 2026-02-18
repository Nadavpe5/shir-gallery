import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { generateWebThumbnail } from "@/lib/image-processing";
import { getPublicUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullKey, gallerySlug, filename } = await request.json();

    if (!fullKey || !gallerySlug || !filename) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const webKey = `${gallerySlug}/web/${safeFilename}`;

    const webUrl = await generateWebThumbnail(fullKey, webKey);
    const fullUrl = getPublicUrl(fullKey);

    return NextResponse.json({ webUrl, fullUrl });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
