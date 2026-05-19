"use client";

import { useState } from "react";
import { formatRol } from "@/lib/types";

type ScanRegistro = {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
  centro_educativo: string;
  qr_bloqueado: boolean;
  check_in_realizado: boolean;
  entrada_realizada: boolean;
  salida_realizada: boolean;
};

export default function ScanPage({ initialRegistro }: { initialRegistro: ScanRegistro }) {
  const [registro, setRegistro] = useState(initialRegistro);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function runAction(action: "checkin" | "entrada" | "salida") {
    setLoading(action);
    setMessage("");
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: registro.id, action })
      });
      const data = (await response.json()) as { ok: boolean; error?: string; registro?: ScanRegistro };
      if (!response.ok || !data.ok || !data.registro) {
        throw new Error(data.error || "No se pudo procesar la acción.");
      }
      setRegistro(data.registro);
      setMessage("Acción registrada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo procesar la acción.");
    } finally {
      setLoading(null);
    }
  }

  const blocked = registro.qr_bloqueado;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f9fc] px-5 py-8">
      <section className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-skyInstitutional/40 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-skyInstitutional">Club Escolar R10</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">
            {registro.nombre} {registro.apellido}
          </h1>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-navy">Rol</dt>
              <dd className="text-slate-700">{formatRol(registro.rol)}</dd>
            </div>
            <div>
              <dt className="font-bold text-navy">Centro educativo</dt>
              <dd className="text-slate-700">{registro.centro_educativo}</dd>
            </div>
          </dl>
        </div>

        {blocked ? (
          <div className="mt-5 rounded-md border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
            QR no disponible aún. Será habilitado el día del evento.
          </div>
        ) : null}

        {message ? <div className="mt-5 rounded-md border border-skyInstitutional/60 bg-skyInstitutional/15 px-4 py-3 text-sm text-navy">{message}</div> : null}

        <div className="mt-6 grid gap-3">
          <ActionButton
            label="Realizar Check-In"
            loading={loading === "checkin"}
            disabled={blocked || registro.check_in_realizado || loading !== null}
            onClick={() => runAction("checkin")}
          />
          <ActionButton
            label="Registrar Entrada"
            loading={loading === "entrada"}
            disabled={blocked || registro.entrada_realizada || loading !== null}
            onClick={() => runAction("entrada")}
          />
          <ActionButton
            label="Registrar Salida"
            loading={loading === "salida"}
            disabled={blocked || registro.salida_realizada || !registro.entrada_realizada || loading !== null}
            onClick={() => runAction("salida")}
          />
        </div>
      </section>
    </main>
  );
}

function ActionButton({ label, disabled, loading, onClick }: { label: string; disabled: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button className="primary-button min-h-12 w-full disabled:bg-slate-300 disabled:text-slate-600" disabled={disabled} onClick={onClick} type="button">
      {loading ? "Procesando..." : label}
    </button>
  );
}
