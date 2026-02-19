import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
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

    console.log("[process] Starting:", { fullKey, galleryId, gallerySlug, filename, type });

    if (!fullKey || !galleryId || !gallerySlug || !filename) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const fullUrl = getPublicUrl(fullKey);
    const sortOrder = Math.floor(Date.now() / 1000);

    let webUrl = fullUrl;
    let imgWidth: number | null = null;
    let imgHeight: number | null = null;
    try {
      const { generateWebThumbnail } = await import("@/lib/image-processing");
      const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const webKey = `${gallerySlug}/web/${sortOrder}-${safeFilename}`;
      const result = await generateWebThumbnail(fullKey, webKey);
      webUrl = result.url;
      imgWidth = result.width;
      imgHeight = result.height;
      console.log("[process] Thumbnail generated:", webKey, `${imgWidth}x${imgHeight}`);
    } catch (err) {
      console.warn("[process] Thumbnail failed, using full URL:", err instanceof Error ? err.message : err);
    }

    console.log("[process] Inserting into DB:", { galleryId, webUrl, fullUrl, type, filename, sortOrder });

    const { data, error } = await supabaseAdmin
      .from("gallery_assets")
      .insert({
        gallery_id: galleryId,
        web_url: webUrl,
        full_url: fullUrl,
        type,
        filename,
        sort_order: sortOrder,
        ...(imgWidth && imgHeight ? { width: imgWidth, height: imgHeight } : {}),
      })
      .select()
      .single();

    if (error) {
      console.error("[process] DB insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[process] Success, asset ID:", data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[process] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
