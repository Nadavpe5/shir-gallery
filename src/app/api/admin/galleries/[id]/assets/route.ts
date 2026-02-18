import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

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
    .from("gallery_assets")
    .select("*")
    .eq("gallery_id", id)
    .order("type")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const assets = Array.isArray(body) ? body : [body];
  const rows = assets.map((a: Record<string, unknown>, i: number) => ({
    gallery_id: id,
    web_url: a.web_url,
    full_url: a.full_url,
    type: a.type || "gallery",
    sort_order: a.sort_order ?? i,
    filename: a.filename || null,
  }));

  const { data, error } = await supabaseAdmin
    .from("gallery_assets")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { assetIds } = await request.json();

  if (!assetIds || !Array.isArray(assetIds)) {
    return NextResponse.json({ error: "assetIds required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("gallery_assets")
    .delete()
    .eq("gallery_id", id)
    .in("id", assetIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
