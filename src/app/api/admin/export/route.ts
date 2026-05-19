import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { isAdminRequest, unauthorizedResponse } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { formatRol, type Registro } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    const { data, error } = await getSupabaseAdmin().from("registros").select("*").order("created_at", { ascending: false });
    if (error) throw new Error("No se pudieron exportar los registros.");

    const rows = (data as Registro[]).map((registro) => ({
      ID: registro.id,
      Nombre: registro.nombre,
      Apellido: registro.apellido,
      Cedula: registro.cedula,
      Correo: registro.correo,
      Telefono: registro.telefono,
      Edad: registro.edad,
      Rol: formatRol(registro.rol),
      "Area / Comision": registro.area,
      Distrito: registro.distrito_educativo,
      "Centro Educativo": registro.centro_educativo,
      "Estado QR": registro.qr_bloqueado ? "Bloqueado" : "Desbloqueado",
      "Check-In": registro.check_in_realizado ? "Si" : "No",
      Entrada: registro.entrada_realizada ? "Si" : "No",
      Salida: registro.salida_realizada ? "Si" : "No",
      "Fecha Registro": registro.timestamp_registro || registro.created_at || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const date = new Date().toISOString().slice(0, 10);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registros_evento_${date}.xlsx"`
      }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}
