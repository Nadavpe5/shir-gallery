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
        .select("slug, zip_url, client_name, shoot_date")
        .eq("id", id)
        .single();

      const { data: assets } = await supabaseAdmin
        .from("gallery_assets")
        .select("full_url, filename")
        .eq("gallery_id", id);

      if (gallery && assets && assets.length > 0) {
        // Delete old ZIP from R2 before creating new one
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
        zipUrl = await generateAndUploadZip(gallery.slug, assets, gallery.client_name, gallery.shoot_date);
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
