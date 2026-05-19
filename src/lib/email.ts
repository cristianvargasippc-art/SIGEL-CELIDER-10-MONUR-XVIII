import { Resend } from "resend";
import { formatRol, type Registro } from "@/lib/types";
import { getQrUrl } from "@/lib/qr";

const EVENT_INSTRUCTIONS = [
  "Presente este código QR al llegar al área de acreditación del evento.",
  "El QR permanecerá bloqueado hasta que la coordinación habilite el acceso el día del evento.",
  "Lleve un documento de identificación para validar sus datos durante el proceso de entrada.",
  "Conserve este correo; el mismo QR será usado para check-in, entrada y salida."
];

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(key);
}

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendRegistrationEmail(registro: Registro, qrDataUrl: string) {
  const html = buildRegistrationEmail(registro, qrDataUrl);
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "Club Escolar R10 <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: registro.correo,
    subject: "Confirmación de Pre-Check-In - Club Escolar R10",
    html
  });
}

function buildRegistrationEmail(registro: Registro, qrDataUrl: string) {
  const rows = [
    ["Nombre", `${registro.nombre} ${registro.apellido}`],
    ["Cédula", registro.cedula],
    ["Correo", registro.correo],
    ["Teléfono", registro.telefono],
    ["Edad", registro.edad],
    ["Rol", formatRol(registro.rol)],
    ["Area", registro.area],
    ["Distrito educativo", registro.distrito_educativo],
    ["Centro educativo", registro.centro_educativo]
  ];

  return `
  <!doctype html>
  <html lang="es">
    <body style="margin:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#0D2B5E;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;background:#FFFFFF;border:1px solid #dbe7f0;">
              <tr>
                <td style="background:#0D2B5E;padding:28px;color:#FFFFFF;">
                  <div style="font-size:20px;font-weight:800;letter-spacing:.04em;">Club Escolar R10</div>
                  <div style="height:4px;width:96px;background:#7DB8D8;margin-top:12px;"></div>
                  <div style="font-size:14px;margin-top:14px;">Ministerio de Educación - PLE-RD</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <h1 style="font-size:24px;margin:0 0 12px;">Pre-Check-In confirmado</h1>
                  <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
                    Saludos, ${escapeHtml(registro.nombre)}. Hemos recibido correctamente sus datos de registro.
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 24px;">
                    ${rows
                      .map(
                        ([label, value]) => `
                          <tr>
                            <td style="border:1px solid #dbe7f0;padding:10px 12px;font-weight:700;background:#eef6fb;">${escapeHtml(label)}</td>
                            <td style="border:1px solid #dbe7f0;padding:10px 12px;">${escapeHtml(value)}</td>
                          </tr>`
                      )
                      .join("")}
                  </table>
                  <div style="text-align:center;margin:24px 0;">
                    <img src="${qrDataUrl}" width="220" height="220" alt="Código QR de registro" style="border:8px solid #eef6fb;" />
                    <p style="font-size:13px;color:#445;margin:12px 0 0;">URL del QR: ${escapeHtml(getQrUrl(registro.id))}</p>
                  </div>
                  <p style="font-size:16px;font-weight:700;margin:0 0 8px;">Instrucciones del evento</p>
                  <ul style="font-size:15px;line-height:1.6;margin:0 0 24px;padding-left:20px;">
                    ${EVENT_INSTRUCTIONS.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                  <p style="font-size:15px;line-height:1.6;margin:0;">
                    Su QR no está disponible aún. Será habilitado el día del evento por el equipo organizador.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#0D2B5E;color:#FFFFFF;padding:18px 30px;font-size:13px;text-align:center;">
                  Club Escolar R10 - Ministerio de Educación - PLE-RD
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
