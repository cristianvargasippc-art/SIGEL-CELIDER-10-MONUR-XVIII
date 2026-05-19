import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionValue, isValidAdminSecret } from "@/lib/auth";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.allowed) {
    return Response.json({ ok: false, error: "Demasiados intentos. Intente nuevamente más tarde." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success || !isValidAdminSecret(parsed.data.secret)) {
      return Response.json({ ok: false, error: "Credenciales inválidas" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, adminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });
    return response;
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}
