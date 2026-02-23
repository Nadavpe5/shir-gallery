import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const galleryId = request.nextUrl.searchParams.get("galleryId");
  const section = request.nextUrl.searchParams.get("section"); // "highlights" | "gallery" | "originals"

  if (!galleryId || !section) {
    return NextResponse.json(
      { error: "Missing galleryId or section parameter" },
      { status: 400 }
    );
  }

  if (!["highlights", "gallery", "originals"].includes(section)) {
    return NextResponse.json(
      { error: "Invalid section. Must be highlights, gallery, or originals" },
      { status: 400 }
    );
  }

  try {
    // Fetch the section ZIP URL
    const { data: gallery } = await supabaseAdmin
      .from("galleries")
      .select("zip_highlights_url, zip_gallery_url, zip_originals_url")
      .eq("id", galleryId)
      .single();

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Get the appropriate section URL
    const zipUrl =
      section === "highlights"
        ? gallery.zip_highlights_url
        : section === "gallery"
        ? gallery.zip_gallery_url
        : gallery.zip_originals_url;

    if (!zipUrl) {
      return NextResponse.json(
        { error: `${section} ZIP not available` },
        { status: 404 }
      );
    }

    // Extract key from URL and generate signed download URL
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
    const key = zipUrl.replace(`${publicUrl}/`, "");
    const filename = `${section}.zip`;
    
    const signedUrl = await getSignedDownloadUrl(key, filename);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("[download-section] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
