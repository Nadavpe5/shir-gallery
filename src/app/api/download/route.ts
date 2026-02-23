import { NextRequest, NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const name = request.nextUrl.searchParams.get("name") || "photo.jpg";

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const allowedHost = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (allowedHost && !url.startsWith(allowedHost)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
  }

  try {
    const key = url.replace(`${allowedHost}/`, "");
    const signedUrl = await getSignedDownloadUrl(key, name);
    
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("[download] Failed to generate signed URL:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
