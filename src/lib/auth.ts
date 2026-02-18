import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { supabaseAdmin } from "./supabase-server";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_TTL_DAYS = 7;
const COOKIE_PREFIX = "gallery_session_";

function hmacSign(payload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

export function signToken(sessionId: string, expiresAt: Date): string {
  const payload = `${sessionId}:${expiresAt.getTime()}`;
  const signature = hmacSign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifyToken(token: string): {
  sessionId: string;
  exp: number;
} | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString();
  } catch {
    return null;
  }

  const expectedSignature = hmacSign(payload);
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return null;
  }

  const [sessionId, expStr] = payload.split(":");
  const exp = parseInt(expStr, 10);
  if (!sessionId || isNaN(exp)) return null;
  if (Date.now() > exp) return null;

  return { sessionId, exp };
}

function cookieName(slug: string): string {
  return `${COOKIE_PREFIX}${slug}`;
}

export async function createSession(
  galleryId: string,
  slug: string,
  ip: string | null,
  userAgent: string | null
): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const { data, error } = await supabaseAdmin
    .from("gallery_sessions")
    .insert({
      gallery_id: galleryId,
      expires_at: expiresAt.toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create session");
  }

  const token = signToken(data.id, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(cookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/g/${slug}`,
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function validateSession(
  slug: string
): Promise<{ sessionId: string; galleryId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(slug))?.value;
  if (!token) return null;

  const parsed = verifyToken(token);
  if (!parsed) return null;

  const { data: session } = await supabaseAdmin
    .from("gallery_sessions")
    .select("id, gallery_id, revoked")
    .eq("id", parsed.sessionId)
    .single();

  if (!session || session.revoked) return null;

  return { sessionId: session.id, galleryId: session.gallery_id };
}

export async function revokeSession(slug: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(slug))?.value;

  if (token) {
    const parsed = verifyToken(token);
    if (parsed) {
      await supabaseAdmin
        .from("gallery_sessions")
        .update({ revoked: true })
        .eq("id", parsed.sessionId);
    }
  }

  cookieStore.delete({
    name: cookieName(slug),
    path: `/g/${slug}`,
  });
}

export async function clearSessionCookie(slug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: cookieName(slug),
    path: `/g/${slug}`,
  });
}
