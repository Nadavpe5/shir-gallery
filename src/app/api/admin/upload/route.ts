import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { uploadBuffer, getPublicUrl } from "@/lib/r2";
import { generateWebThumbnail } from "@/lib/image-processing";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const galleryId = formData.get("galleryId") as string | null;
    const gallerySlug = formData.get("gallerySlug") as string | null;
    const type = (formData.get("type") as string) || "gallery";

    if (!file || !galleryId || !gallerySlug) {
      return NextResponse.json(
        { error: "file, galleryId, and gallerySlug are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sortOrder = Math.floor(Date.now() / 1000);
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullKey = `${gallerySlug}/full/${sortOrder}-${safeFilename}`;

    await uploadBuffer(fullKey, buffer, file.type);

    const webKey = `${gallerySlug}/web/${sortOrder}-${safeFilename}`;
    let webUrl: string;
    try {
      webUrl = await generateWebThumbnail(fullKey, webKey);
    } catch {
      webUrl = getPublicUrl(fullKey);
    }

    const fullUrl = getPublicUrl(fullKey);

    const { data, error } = await supabaseAdmin
      .from("gallery_assets")
      .insert({
        gallery_id: galleryId,
        web_url: webUrl,
        full_url: fullUrl,
        type,
        filename: file.name,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
