import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import sharp from "sharp";
import { getObjectBuffer, uploadBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: galleryId } = await params;
  const { assetId, direction = "cw" } = await request.json();

  if (!assetId) {
    return NextResponse.json({ error: "Missing assetId" }, { status: 400 });
  }

  const angle = direction === "ccw" ? -90 : 90;

  const { data: asset, error: fetchError } = await supabaseAdmin
    .from("gallery_assets")
    .select("*")
    .eq("id", assetId)
    .eq("gallery_id", galleryId)
    .single();

  if (fetchError || !asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

  try {
    const fullKey = asset.full_url.replace(`${publicUrl}/`, "").split("?")[0];
    const fullBuffer = await getObjectBuffer(fullKey);
    const rotatedFull = await sharp(fullBuffer).rotate(angle).toBuffer();
    await uploadBuffer(fullKey, rotatedFull, "image/jpeg");

    const webKey = asset.web_url.replace(`${publicUrl}/`, "").split("?")[0];
    const WEB_MAX_WIDTH = 2400;
    const WEB_QUALITY = 85;
    const rotatedWeb = await sharp(rotatedFull)
      .resize(WEB_MAX_WIDTH, undefined, { withoutEnlargement: true })
      .jpeg({ quality: WEB_QUALITY, progressive: true })
      .toBuffer();
    await uploadBuffer(webKey, rotatedWeb, "image/jpeg");

    const cacheBust = `?v=${Date.now()}`;
    const newFullUrl = `${publicUrl}/${fullKey}${cacheBust}`;
    const newWebUrl = `${publicUrl}/${webKey}${cacheBust}`;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("gallery_assets")
      .update({ full_url: newFullUrl, web_url: newWebUrl })
      .eq("id", assetId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[rotate] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rotation failed" },
      { status: 500 }
    );
  }
}
