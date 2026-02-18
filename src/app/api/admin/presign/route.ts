import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { getPresignedUploadUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, contentType, gallerySlug } = await request.json();

    if (!filename || !contentType || !gallerySlug) {
      return NextResponse.json(
        { error: "filename, contentType, and gallerySlug are required" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${gallerySlug}/full/${timestamp}-${safeFilename}`;

    const url = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
