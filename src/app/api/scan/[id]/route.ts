import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "QR inválido" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("registros")
      .select("id,nombre,apellido,rol,centro_educativo,qr_bloqueado,check_in_realizado,entrada_realizada,salida_realizada")
      .eq("id", parsed.data.id)
      .single();

    if (error || !data) {
      return Response.json({ ok: false, error: "Registro no encontrado" }, { status: 404 });
    }

    return Response.json({ ok: true, registro: data });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}
