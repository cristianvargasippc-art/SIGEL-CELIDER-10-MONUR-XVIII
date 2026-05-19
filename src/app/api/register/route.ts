import { NextRequest } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import { registroSchema } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { generateQrDataUrl, getQrUrl } from "@/lib/qr";
import { getIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getIp(request);
  const limited = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.allowed) {
    return Response.json({ ok: false, error: "Demasiados intentos. Intente nuevamente más tarde." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = registroSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { comision, ...registro } = parsed.data;
    const insertData = {
      ...registro,
      area: comision ? `${registro.area} - Comision: ${comision}` : registro.area
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("registros").insert(insertData).select("*").single();

    if (error) {
      return Response.json({ ok: false, error: mapSupabaseError(error) }, { status: error.code === "23505" ? 409 : 500 });
    }

    const qr = await generateQrDataUrl(data.id);

    return Response.json({ ok: true, id: data.id, qrDataUrl: qr, qrUrl: getQrUrl(data.id) });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, { status: 500 });
  }
}

function mapSupabaseError(error: PostgrestError) {
  if (error.code === "23505") {
    return "Ya existe un registro con ese correo o cédula.";
  }
  return "No se pudo guardar el registro.";
}
