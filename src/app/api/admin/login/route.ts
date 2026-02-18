import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const valid = await verifyAdminToken(token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await setAdminCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
