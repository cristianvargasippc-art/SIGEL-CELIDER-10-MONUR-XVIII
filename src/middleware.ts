import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "club_r10_admin";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const expected = await sha256(`club-r10:${secret}`);
  const session = request.cookies.get(ADMIN_COOKIE)?.value || "";

  if (session !== expected) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const config = {
  matcher: ["/admin/dashboard/:path*"]
};
