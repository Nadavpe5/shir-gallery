import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET!;
const COOKIE_NAME = "admin_session";
const ADMIN_TTL_DAYS = 30;

function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  return token === ADMIN_SECRET;
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();

  // Clean up any legacy cookie that was set with the old path
  try { cookieStore.delete({ name: COOKIE_NAME, path: "/admin" }); } catch {}

  const value = hashSecret(ADMIN_SECRET);
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !process.env.DISABLE_SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function validateAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === hashSecret(ADMIN_SECRET);
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: "/" });
  // Also clear legacy cookie that may have been set with the old path
  try { cookieStore.delete({ name: COOKIE_NAME, path: "/admin" }); } catch {}
}
