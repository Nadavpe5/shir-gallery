import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, contentType, gallerySlug } = await request.json();

    if (!filename || !contentType || !gallerySlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullKey = `${gallerySlug}/full/${timestamp}-${safeFilename}`;

    const uploadUrl = await getPresignedUploadUrl(fullKey, contentType);
    const publicUrl = getPublicUrl(fullKey);

    return NextResponse.json({
      uploadUrl,
      fullKey,
      publicUrl,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
