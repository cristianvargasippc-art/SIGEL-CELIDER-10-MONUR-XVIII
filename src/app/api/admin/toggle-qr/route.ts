import { NextRequest } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { toggleQrSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    const parsed = toggleQrSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("registros")
      .update({ qr_bloqueado: parsed.data.qr_bloqueado })
      .eq("id", parsed.data.id);

    if (error) throw new Error("No se pudo actualizar el estado del QR.");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}
