import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateWebThumbnail } from "@/lib/image-processing";

export const runtime = "nodejs";
export const maxDuration = 300;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: gallery } = await supabaseAdmin
    .from("galleries")
    .select("slug, cover_image_url")
    .eq("id", id)
    .single();

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const { data: assets } = await supabaseAdmin
    .from("gallery_assets")
    .select("id, full_url, web_url")
    .eq("gallery_id", id);

  if (!assets || assets.length === 0) {
    return NextResponse.json({ error: "No assets to regenerate" }, { status: 400 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
  let processed = 0;
  let failed = 0;
  let orphaned = 0;
  const orphanIds: string[] = [];

  for (const asset of assets) {
    try {
      const fullKey = asset.full_url.replace(`${publicUrl}/`, "").split("?")[0];
      const webKey = `${gallery.slug}/web/${Date.now()}-${fullKey.split("/").pop()}`;

      const result = await generateWebThumbnail(fullKey, webKey);

      await supabaseAdmin
        .from("gallery_assets")
        .update({ web_url: result.url, width: result.width, height: result.height })
        .eq("id", asset.id);

      processed++;
      console.log(`[regenerate] ${processed}/${assets.length}: ${asset.id}`);
    } catch (err: unknown) {
      const isNoSuchKey = err instanceof Error && (
        err.message.includes("NoSuchKey") || err.name === "NoSuchKey"
      );
      if (isNoSuchKey) {
        orphaned++;
        orphanIds.push(asset.id);
        console.warn(`[regenerate] Orphan (source missing in R2): ${asset.id}`);
      } else {
        failed++;
        console.error(`[regenerate] Failed asset ${asset.id}:`, err);
      }
    }
  }

  if (orphanIds.length > 0) {
    await supabaseAdmin
      .from("gallery_assets")
      .delete()
      .in("id", orphanIds);
    console.log(`[regenerate] Cleaned up ${orphanIds.length} orphan assets`);
  }

  if (gallery.cover_image_url) {
    const oldWebUrls = assets.map((a) => a.web_url);
    if (oldWebUrls.includes(gallery.cover_image_url)) {
      const coverAsset = assets.find((a) => a.web_url === gallery.cover_image_url);
      if (coverAsset && !orphanIds.includes(coverAsset.id)) {
        await supabaseAdmin
          .from("galleries")
          .update({ cover_image_url: coverAsset.full_url })
          .eq("id", id);
        console.log(`[regenerate] Updated cover_image_url to full_url`);
      }
    }
  }

  return NextResponse.json({
    total: assets.length,
    processed,
    failed,
    orphaned,
  });
}
