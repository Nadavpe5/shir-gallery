import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 120;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { published } = await request.json();

  let zipUrl: string | null = null;
  let zipError: string | null = null;

  if (published) {
    try {
      const { data: gallery } = await supabaseAdmin
        .from("galleries")
        .select("slug, zip_url, client_name, shoot_date, zip_asset_count")
        .eq("id", id)
        .single();

      const { data: assets } = await supabaseAdmin
        .from("gallery_assets")
        .select("full_url, filename")
        .eq("gallery_id", id);

      if (!gallery) {
        return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
      }

      if (!assets || assets.length === 0) {
        zipError = "No assets to include in ZIP";
        console.warn("[publish] No assets found for gallery:", id);
      } else {
        const currentAssetCount = assets.length;
        
        const needsRegeneration = 
          !gallery.zip_url ||
          !gallery.zip_asset_count ||
          gallery.zip_asset_count !== currentAssetCount;
        
        if (needsRegeneration) {
          console.log(`[publish] Regenerating ZIP (assets: ${gallery.zip_asset_count || 0} → ${currentAssetCount})`);
          
          if (gallery.zip_url) {
            try {
              const { deleteObject } = await import("@/lib/r2");
              const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
              const oldKey = gallery.zip_url.replace(`${publicUrl}/`, "");
              await deleteObject(oldKey);
              console.log("[publish] Deleted old ZIP:", oldKey);
            } catch (e) {
              console.warn("[publish] Failed to delete old ZIP:", e);
            }
          }

          const { generateAndUploadZip } = await import("@/lib/zip-generator");
          const zipResult = await generateAndUploadZip(gallery.slug, assets, gallery.client_name, gallery.shoot_date);
          zipUrl = zipResult.url;
          
          updateData.zip_url = zipResult.url;
          updateData.zip_generated_at = new Date().toISOString();
          updateData.zip_asset_count = zipResult.assetCount;
          updateData.zip_size_bytes = zipResult.sizeBytes;
          
          console.log("[publish] ZIP generated:", zipResult.url);
        } else {
          console.log(`[publish] Skipping ZIP regeneration (${currentAssetCount} assets unchanged)`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      zipError = `ZIP generation failed: ${errorMessage}`;
      console.error("[publish] ZIP generation failed:", err);
    }
  }

  const updateData: Record<string, unknown> = {
    status: published ? "published" : "draft",
  };
  
  if (!published) {
    updateData.zip_url = null;
  }

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return with warning if ZIP generation failed
  if (published && zipError) {
    return NextResponse.json({ 
      ...data, 
      warning: zipError 
    }, { status: 200 });
  }

  return NextResponse.json(data);
}
