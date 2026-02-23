import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const galleryId = request.nextUrl.searchParams.get("galleryId");

  if (!galleryId) {
    return NextResponse.json(
      { error: "Missing galleryId parameter" },
      { status: 400 }
    );
  }

  try {
    const { data: gallery } = await supabaseAdmin
      .from("galleries")
      .select("slug, client_name, zip_highlights_url, zip_gallery_url, zip_originals_url")
      .eq("id", galleryId)
      .single();

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const sections = [];
    
    if (gallery.zip_highlights_url) {
      sections.push({
        url: gallery.zip_highlights_url,
        name: `${gallery.client_name || gallery.slug}_Highlights.zip`,
      });
    }
    
    if (gallery.zip_gallery_url) {
      sections.push({
        url: gallery.zip_gallery_url,
        name: `${gallery.client_name || gallery.slug}_Gallery.zip`,
      });
    }
    
    if (gallery.zip_originals_url) {
      sections.push({
        url: gallery.zip_originals_url,
        name: `${gallery.client_name || gallery.slug}_Originals.zip`,
      });
    }

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "No section ZIPs available. Please republish the gallery." },
        { status: 404 }
      );
    }

    console.log(`[download-all-merged] Returning ${sections.length} section URLs for:`, gallery.slug);

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("[download-all-merged] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch download URLs" },
      { status: 500 }
    );
  }
}
