import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import archiver from "archiver";
import { getObjectBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const galleryId = request.nextUrl.searchParams.get("galleryId");

  if (!galleryId) {
    return NextResponse.json(
      { error: "Missing galleryId parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch gallery section ZIP URLs
    const { data: gallery } = await supabaseAdmin
      .from("galleries")
      .select("slug, client_name, zip_highlights_url, zip_gallery_url, zip_originals_url")
      .eq("id", galleryId)
      .single();

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Check if any sections exist
    if (!gallery.zip_highlights_url && !gallery.zip_gallery_url && !gallery.zip_originals_url) {
      return NextResponse.json(
        { error: "No section ZIPs available" },
        { status: 404 }
      );
    }

    console.log("[download-all-merged] Creating merged ZIP for:", gallery.slug);

    // Create archive
    const archive = archiver("zip", { zlib: { level: 0 } }); // No compression for speed

    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

    // Add each section that exists
    if (gallery.zip_highlights_url) {
      console.log("[download-all-merged] Adding Highlights section");
      const key = gallery.zip_highlights_url.replace(`${publicUrl}/`, "");
      const buffer = await getObjectBuffer(key);
      archive.append(buffer, { name: "Highlights.zip" });
    }

    if (gallery.zip_gallery_url) {
      console.log("[download-all-merged] Adding Gallery section");
      const key = gallery.zip_gallery_url.replace(`${publicUrl}/`, "");
      const buffer = await getObjectBuffer(key);
      archive.append(buffer, { name: "Gallery.zip" });
    }

    if (gallery.zip_originals_url) {
      console.log("[download-all-merged] Adding Originals section");
      const key = gallery.zip_originals_url.replace(`${publicUrl}/`, "");
      const buffer = await getObjectBuffer(key);
      archive.append(buffer, { name: "Originals.zip" });
    }

    await archive.finalize();

    const filename = `${gallery.client_name || gallery.slug}_all.zip`;

    console.log("[download-all-merged] Streaming merged ZIP:", filename);

    return new NextResponse(archive as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[download-all-merged] Error:", error);
    return NextResponse.json(
      { error: "Failed to create merged download" },
      { status: 500 }
    );
  }
}
