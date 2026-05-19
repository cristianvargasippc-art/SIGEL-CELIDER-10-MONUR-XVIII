import { z } from "zod";
import { AREAS_MESAS_DIRECTIVAS, AREAS_MESAS_DIRECTIVAS_REQUIEREN_COMISION, ROLES } from "@/lib/types";

const cleanText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Campo obligatorio")
    .max(max, `Maximo ${max} caracteres`)
    .transform((value) => value.replace(/\s+/g, " "));

const optionalCleanText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximo ${max} caracteres`)
    .transform((value) => value.replace(/\s+/g, " "));

export const registroSchema = z
  .object({
    nombre: cleanText(100),
    apellido: cleanText(100),
    correo: z.string().trim().toLowerCase().email("Correo invalido").max(100),
    cedula: z
      .string()
      .trim()
      .min(5, "Cedula invalida")
      .max(20)
      .regex(/^[0-9A-Za-z-]+$/, "Use solo letras, numeros o guiones"),
    telefono: z
      .string()
      .trim()
      .min(7, "Telefono invalido")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "Telefono invalido")
      .transform((value) => value.replace(/\s+/g, " ")),
    edad: z.coerce.number().int().min(1).max(120),
    distrito_educativo: cleanText(100),
    centro_educativo: cleanText(100),
    rol: z.enum(ROLES),
    area: cleanText(100),
    comision: optionalCleanText(100).default("")
  })
  .superRefine((data, ctx) => {
    if (data.rol === "MESAS_DIRECTIVAS" && !AREAS_MESAS_DIRECTIVAS.includes(data.area as never)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["area"],
        message: "Seleccione un area valida para mesas directivas"
      });
    }
    if (data.rol === "MESAS_DIRECTIVAS" && AREAS_MESAS_DIRECTIVAS_REQUIEREN_COMISION.includes(data.area as never) && !data.comision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comision"],
        message: "Indique la comision correspondiente"
      });
    }
  });

export const adminLoginSchema = z.object({
  secret: z.string().min(1, "Token requerido").max(300)
});

export const toggleQrSchema = z.object({
  id: z.string().uuid(),
  qr_bloqueado: z.boolean()
});

export const checkinSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["checkin", "entrada", "salida"])
});

export type RegistroInput = z.infer<typeof registroSchema>;
