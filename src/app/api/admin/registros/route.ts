import { NextRequest } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { ROLES, type AdminSummary, type Registro, type Rol } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    const { data, error } = await getSupabaseAdmin().from("registros").select("*").order("created_at", { ascending: false });
    if (error) throw new Error("No se pudieron cargar los registros.");
    const registros = data as Registro[];

    return Response.json({ ok: true, registros, summary: buildSummary(registros) });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}

function buildSummary(registros: Registro[]): AdminSummary {
  const emptyRole = () => ({ registrados: 0, checkIn: 0, entradas: 0, salidas: 0 });
  const porRol = Object.fromEntries(ROLES.map((rol) => [rol, emptyRole()])) as AdminSummary["porRol"];

  registros.forEach((registro) => {
    const bucket = porRol[registro.rol as Rol];
    bucket.registrados += 1;
    if (registro.check_in_realizado) bucket.checkIn += 1;
    if (registro.entrada_realizada) bucket.entradas += 1;
    if (registro.salida_realizada) bucket.salidas += 1;
  });

  return {
    totalRegistrados: registros.length,
    totalCheckIn: registros.filter((registro) => registro.check_in_realizado).length,
    totalEntradas: registros.filter((registro) => registro.entrada_realizada).length,
    totalSalidas: registros.filter((registro) => registro.salida_realizada).length,
    porRol
  };
}
