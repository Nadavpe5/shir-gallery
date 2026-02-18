import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Missing slug or password" },
        { status: 400 }
      );
    }

    const { data: gallery, error } = await supabaseAdmin
      .from("galleries")
      .select("id, password_hash, expires_at")
      .eq("slug", slug)
      .single();

    if (error || !gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    if (new Date(gallery.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This gallery has expired" },
        { status: 410 }
      );
    }

    const valid = await bcrypt.compare(password, gallery.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || null;
    const userAgent = request.headers.get("user-agent") || null;

    await createSession(gallery.id, slug, ip, userAgent);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
