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

  if (published) {
    try {
      const { data: gallery } = await supabaseAdmin
        .from("galleries")
        .select("slug, zip_url")
        .eq("id", id)
        .single();

      const { data: assets } = await supabaseAdmin
        .from("gallery_assets")
        .select("full_url, filename")
        .eq("gallery_id", id);

      if (gallery && assets && assets.length > 0) {
        const { generateAndUploadZip } = await import("@/lib/zip-generator");
        zipUrl = await generateAndUploadZip(gallery.slug, assets);
        console.log("[publish] ZIP generated:", zipUrl);
      }
    } catch (err) {
      console.error("[publish] ZIP generation failed:", err);
    }
  }

  const updateData: Record<string, unknown> = {
    status: published ? "published" : "draft",
  };
  if (zipUrl) updateData.zip_url = zipUrl;

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
