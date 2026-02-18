import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: original, error: fetchError } = await supabaseAdmin
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { id: _id, created_at: _ca, ...rest } = original;
  const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;

  const { data: newGallery, error: insertError } = await supabaseAdmin
    .from("galleries")
    .insert({ ...rest, slug: newSlug, status: "draft" })
    .select()
    .single();

  if (insertError || !newGallery) {
    return NextResponse.json({ error: "Failed to duplicate" }, { status: 500 });
  }

  const { data: assets } = await supabaseAdmin
    .from("gallery_assets")
    .select("*")
    .eq("gallery_id", id);

  if (assets && assets.length > 0) {
    const newAssets = assets.map(({ id: _aid, gallery_id: _gid, created_at: _aca, ...assetRest }) => ({
      ...assetRest,
      gallery_id: newGallery.id,
    }));
    await supabaseAdmin.from("gallery_assets").insert(newAssets);
  }

  return NextResponse.json(newGallery, { status: 201 });
}
