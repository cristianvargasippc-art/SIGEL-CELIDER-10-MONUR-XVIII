import { createHash, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export const ADMIN_COOKIE = "club_r10_admin";

export function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return secret;
}

export function adminSessionValue(secret = getAdminSecret()) {
  return createHash("sha256").update(`club-r10:${secret}`).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminSecret(value: string) {
  return safeEqual(value, getAdminSecret());
}

export function isAdminRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (bearer && isValidAdminSecret(bearer)) {
    return true;
  }

  const cookieValue = request.cookies.get(ADMIN_COOKIE)?.value || "";
  return Boolean(cookieValue) && safeEqual(cookieValue, adminSessionValue());
}

export function unauthorizedResponse() {
  return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
}
