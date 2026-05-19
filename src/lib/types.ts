export const ROLES = [
  "MESAS_DIRECTIVAS",
  "TECNICOS_DOCENTES",
  "STAFF",
  "PERIODISTA_CLIT",
  "INVITADOS_ESPECIALES",
  "SECRETARIAS_GENERALES",
  "SUBSECRETARIAS",
  "EQUIPO_LOGISTICO"
] as const;

export const ROLE_LABELS = {
  MESAS_DIRECTIVAS: "Mesas Directivas",
  TECNICOS_DOCENTES: "Tecnicos Docentes",
  STAFF: "Staff",
  PERIODISTA_CLIT: "Periodista CLIT",
  INVITADOS_ESPECIALES: "Invitados Especiales",
  SECRETARIAS_GENERALES: "Secretarias Generales",
  SUBSECRETARIAS: "Subsecretarias",
  EQUIPO_LOGISTICO: "Equipo Logistico"
} as const;

export const AREAS_MESAS_DIRECTIVAS = ["Director General", "Director Adjunto", "Evaluacion y Control"] as const;
export const AREAS_MESAS_DIRECTIVAS_REQUIEREN_COMISION = ["Director General", "Director Adjunto", "Evaluacion y Control"] as const;

export type Rol = (typeof ROLES)[number];

export function formatRol(rol: string) {
  return ROLE_LABELS[rol as Rol] || rol.replace(/_/g, " ");
}

export type Registro = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  telefono: string;
  edad: number;
  distrito_educativo: string;
  centro_educativo: string;
  rol: Rol;
  area: string;
  qr_bloqueado: boolean;
  check_in_realizado: boolean;
  entrada_realizada: boolean;
  salida_realizada: boolean;
  timestamp_registro: string | null;
  timestamp_checkin: string | null;
  timestamp_entrada: string | null;
  timestamp_salida: string | null;
  created_at: string | null;
};

export type RegistroInsert = Omit<
  Registro,
  | "id"
  | "qr_bloqueado"
  | "check_in_realizado"
  | "entrada_realizada"
  | "salida_realizada"
  | "timestamp_registro"
  | "timestamp_checkin"
  | "timestamp_entrada"
  | "timestamp_salida"
  | "created_at"
>;

export type AdminSummary = {
  totalRegistrados: number;
  totalCheckIn: number;
  totalEntradas: number;
  totalSalidas: number;
  porRol: Record<Rol, { registrados: number; checkIn: number; entradas: number; salidas: number }>;
};
