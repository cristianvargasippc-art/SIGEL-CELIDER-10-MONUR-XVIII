import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { checkinSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = checkinSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: registro, error: readError } = await supabase.from("registros").select("*").eq("id", parsed.data.id).single();
    if (readError || !registro) {
      return Response.json({ ok: false, error: "Registro no encontrado" }, { status: 404 });
    }
    if (registro.qr_bloqueado) {
      return Response.json({ ok: false, error: "QR no disponible aún. Será habilitado el día del evento." }, { status: 403 });
    }

    const update = getActionUpdate(parsed.data.action, registro);
    if (!update.allowed) {
      return Response.json({ ok: false, error: update.error }, { status: 409 });
    }

    const { data, error } = await supabase.from("registros").update(update.values).eq("id", parsed.data.id).select("*").single();
    if (error) throw new Error("No se pudo actualizar el registro.");
    return Response.json({ ok: true, registro: data });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}

function getActionUpdate(action: "checkin" | "entrada" | "salida", registro: { check_in_realizado: boolean; entrada_realizada: boolean; salida_realizada: boolean }) {
  const now = new Date().toISOString();
  if (action === "checkin") {
    if (registro.check_in_realizado) return { allowed: false, error: "El check-in ya fue realizado.", values: {} };
    return { allowed: true, values: { check_in_realizado: true, timestamp_checkin: now } };
  }
  if (action === "entrada") {
    if (registro.entrada_realizada) return { allowed: false, error: "La entrada ya fue registrada.", values: {} };
    return { allowed: true, values: { entrada_realizada: true, timestamp_entrada: now } };
  }
  if (!registro.entrada_realizada) return { allowed: false, error: "Debe registrar entrada antes de registrar salida.", values: {} };
  if (registro.salida_realizada) return { allowed: false, error: "La salida ya fue registrada.", values: {} };
  return { allowed: true, values: { salida_realizada: true, timestamp_salida: now } };
}
