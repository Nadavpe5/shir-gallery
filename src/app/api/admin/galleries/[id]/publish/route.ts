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

  let zipError: string | null = null;
  const updateData: Record<string, unknown> = {
    status: published ? "published" : "draft",
  };

  if (published) {
    try {
      const { data: gallery } = await supabaseAdmin
        .from("galleries")
        .select("slug, zip_highlights_count, zip_gallery_count, zip_originals_count")
        .eq("id", id)
        .single();

      const { data: assets } = await supabaseAdmin
        .from("gallery_assets")
        .select("full_url, filename, type")
        .eq("gallery_id", id);

      if (!gallery) {
        return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
      }

      if (!assets || assets.length === 0) {
        zipError = "No assets to include in ZIP";
        console.warn("[publish] No assets found for gallery:", id);
      } else {
        // Group assets by type
        const highlights = assets.filter(a => a.type === "highlight");
        const galleryAssets = assets.filter(a => a.type === "gallery");
        const originals = assets.filter(a => a.type === "original");

        // Check if each section needs regeneration
        const needsHighlightsRegen = 
          highlights.length > 0 && 
          (!gallery.zip_highlights_count || gallery.zip_highlights_count !== highlights.length);

        const needsGalleryRegen = 
          galleryAssets.length > 0 && 
          (!gallery.zip_gallery_count || gallery.zip_gallery_count !== galleryAssets.length);

        const needsOriginalsRegen = 
          originals.length > 0 && 
          (!gallery.zip_originals_count || gallery.zip_originals_count !== originals.length);

        if (needsHighlightsRegen || needsGalleryRegen || needsOriginalsRegen) {
          console.log(`[publish] Regenerating section ZIPs:`);
          if (needsHighlightsRegen) console.log(`  - highlights: ${gallery.zip_highlights_count || 0} → ${highlights.length}`);
          if (needsGalleryRegen) console.log(`  - gallery: ${gallery.zip_gallery_count || 0} → ${galleryAssets.length}`);
          if (needsOriginalsRegen) console.log(`  - originals: ${gallery.zip_originals_count || 0} → ${originals.length}`);

          const { generateSectionZips } = await import("@/lib/section-zip-generator");
          const results = await generateSectionZips(gallery.slug, highlights, galleryAssets, originals);

          // Update all section metadata
          updateData.zip_highlights_url = results.highlights.url;
          updateData.zip_highlights_count = results.highlights.assetCount;
          updateData.zip_highlights_size = results.highlights.sizeBytes;
          
          updateData.zip_gallery_url = results.gallery.url;
          updateData.zip_gallery_count = results.gallery.assetCount;
          updateData.zip_gallery_size = results.gallery.sizeBytes;
          
          updateData.zip_originals_url = results.originals.url;
          updateData.zip_originals_count = results.originals.assetCount;
          updateData.zip_originals_size = results.originals.sizeBytes;

          console.log("[publish] Section ZIPs generated successfully");
        } else {
          console.log(`[publish] Skipping ZIP regeneration (all sections unchanged)`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      zipError = `ZIP generation failed: ${errorMessage}`;
      console.error("[publish] ZIP generation failed:", err);
    }
  } else {
    // When unpublishing, clear section URLs but keep metadata for smart regeneration
    updateData.zip_highlights_url = null;
    updateData.zip_gallery_url = null;
    updateData.zip_originals_url = null;
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
