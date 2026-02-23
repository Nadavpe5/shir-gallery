import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { deletePrefix } from "@/lib/r2";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (data && typeof data.design_settings === 'string') {
    try {
      data.design_settings = JSON.parse(data.design_settings);
    } catch (e) {
      console.error('[API GET] Failed to parse design_settings:', e);
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const allowedFields = [
    "client_name", "shoot_title", "subtitle", "location",
    "shoot_date", "slug", "expires_at", "cover_image_url",
    "zip_url", "zip_generated_at", "zip_asset_count", "zip_size_bytes",
    "edited_count", "originals_count", "design_settings",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (body.password) {
    updates.password_hash = await bcrypt.hash(body.password, 10);
  }

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: gallery } = await supabaseAdmin
    .from("galleries")
    .select("slug")
    .eq("id", id)
    .single();

  if (gallery?.slug) {
    try {
      const deleted = await deletePrefix(`${gallery.slug}/`);
      console.log(`[delete] Cleaned ${deleted} R2 objects for ${gallery.slug}`);
    } catch (err) {
      console.error("[delete] R2 cleanup failed:", err);
    }
  }

  const { error } = await supabaseAdmin
    .from("galleries")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
