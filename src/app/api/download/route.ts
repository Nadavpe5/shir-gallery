import { NextRequest, NextResponse } from "next/server";

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
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(response.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
