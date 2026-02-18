import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { generateWebThumbnail } from "@/lib/image-processing";
import { getPublicUrl } from "@/lib/r2";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      fullKey,
      galleryId,
      gallerySlug,
      filename,
      type = "gallery",
    } = await request.json();

    if (!fullKey || !galleryId || !gallerySlug || !filename) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const webKey = `${gallerySlug}/web/${timestamp}-${safeFilename}`;

    let webUrl: string;
    try {
      webUrl = await generateWebThumbnail(fullKey, webKey);
    } catch (err) {
      console.error("Thumbnail generation failed, using full URL:", err);
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
        filename,
        sort_order: timestamp,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
