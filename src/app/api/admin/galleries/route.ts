import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function GET() {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .select("*, gallery_assets(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const isAdmin = await validateAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      client_name,
      shoot_title,
      subtitle,
      location,
      shoot_date,
      slug,
      password,
      expires_at,
      cover_image_url,
    } = body;

    if (!client_name || !slug || !password) {
      return NextResponse.json(
        { error: "client_name, slug, and password are required" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const expiresDate = expires_at
      ? new Date(expires_at).toISOString()
      : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("galleries")
      .insert({
        client_name,
        shoot_title: shoot_title || client_name,
        subtitle: subtitle || null,
        location: location || null,
        shoot_date: shoot_date || null,
        slug,
        password_hash,
        expires_at: expiresDate,
        cover_image_url: cover_image_url || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A gallery with this slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
