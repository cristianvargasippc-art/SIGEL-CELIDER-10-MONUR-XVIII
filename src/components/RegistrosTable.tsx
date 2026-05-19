"use client";

import { formatRol, type Registro } from "@/lib/types";

export default function RegistrosTable({
  registros,
  onToggleQr,
  onOpenQr
}: {
  registros: Registro[];
  onToggleQr: (registro: Registro) => void;
  onOpenQr: (registro: Registro) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full border-collapse text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              {[
                "Nombre",
                "Apellido",
                "Cedula",
                "Rol",
                "Area / Comision",
                "Correo",
                "Telefono",
                "Edad",
                "Centro educativo",
                "Distrito",
                "Estado QR",
                "Check-In",
                "Entrada",
                "Salida",
                "Fecha registro",
                "Acciones"
              ].map((header) => (
                <th key={header} className="px-3 py-3 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <tr key={registro.id} className="border-b border-slate-100 align-top odd:bg-white even:bg-slate-50">
                <Cell>{registro.nombre}</Cell>
                <Cell>{registro.apellido}</Cell>
                <Cell>{registro.cedula}</Cell>
                <Cell>{formatRol(registro.rol)}</Cell>
                <Cell>{registro.area}</Cell>
                <Cell>{registro.correo}</Cell>
                <Cell>{registro.telefono}</Cell>
                <Cell>{registro.edad}</Cell>
                <Cell>{registro.centro_educativo}</Cell>
                <Cell>{registro.distrito_educativo}</Cell>
                <Cell>{registro.qr_bloqueado ? "Bloqueado" : "Desbloqueado"}</Cell>
                <Cell>{registro.check_in_realizado ? "Si" : "No"}</Cell>
                <Cell>{registro.entrada_realizada ? "Si" : "No"}</Cell>
                <Cell>{registro.salida_realizada ? "Si" : "No"}</Cell>
                <Cell>{formatDate(registro.timestamp_registro || registro.created_at)}</Cell>
                <td className="space-y-2 px-3 py-3">
                  <button className="secondary-button w-full" type="button" onClick={() => onToggleQr(registro)}>
                    {registro.qr_bloqueado ? "Desbloquear QR" : "Bloquear QR"}
                  </button>
                  <button className="secondary-button w-full" type="button" onClick={() => onOpenQr(registro)}>
                    Ver QR
                  </button>
                </td>
              </tr>
            ))}
            {registros.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={16}>
                  No hay registros que coincidan con los filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="max-w-[220px] px-3 py-3 text-slate-700">{children}</td>;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
