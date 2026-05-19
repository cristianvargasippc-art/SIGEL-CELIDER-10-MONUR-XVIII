"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import RegistrosTable from "@/components/RegistrosTable";
import { getQrUrl } from "@/lib/qr";
import { ROLES, formatRol, type AdminSummary, type Registro, type Rol } from "@/lib/types";

type ApiResponse = {
  ok: boolean;
  registros: Registro[];
  summary: AdminSummary;
  error?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Rol>("ALL");
  const [qrFilter, setQrFilter] = useState<"ALL" | "BLOCKED" | "UNBLOCKED">("ALL");
  const [qrModal, setQrModal] = useState<{ registro: Registro; dataUrl: string } | null>(null);

  async function loadData() {
    try {
      const response = await fetch("/api/admin/registros", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "No se pudieron cargar los datos.");
      setRegistros(data.registros);
      setSummary(data.summary);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const timer = window.setInterval(() => void loadData(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return registros.filter((registro) => {
      const matchesQuery =
        !normalized ||
        `${registro.nombre} ${registro.apellido}`.toLowerCase().includes(normalized) ||
        registro.cedula.toLowerCase().includes(normalized) ||
        registro.rol.toLowerCase().includes(normalized) ||
        formatRol(registro.rol).toLowerCase().includes(normalized);
      const matchesRole = roleFilter === "ALL" || registro.rol === roleFilter;
      const matchesQr =
        qrFilter === "ALL" || (qrFilter === "BLOCKED" && registro.qr_bloqueado) || (qrFilter === "UNBLOCKED" && !registro.qr_bloqueado);
      return matchesQuery && matchesRole && matchesQr;
    });
  }, [query, registros, roleFilter, qrFilter]);

  async function toggleQr(registro: Registro) {
    const response = await fetch("/api/admin/toggle-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: registro.id, qr_bloqueado: !registro.qr_bloqueado })
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error || "No se pudo actualizar el QR.");
      return;
    }
    await loadData();
  }

  async function openQr(registro: Registro) {
    const dataUrl = await QRCode.toDataURL(getQrUrl(registro.id), {
      width: 520,
      margin: 1,
      color: { dark: "#0D2B5E", light: "#FFFFFF" }
    });
    setQrModal({ registro, dataUrl });
  }

  function exportExcel() {
    window.location.href = "/api/admin/export";
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc]">
      <header className="border-b border-skyInstitutional/40 bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <img src="/imagenes/logo.png" alt="Logo Club Escolar R10" className="h-20 w-20 object-contain sm:h-16 sm:w-16" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-skyInstitutional">Panel administrativo</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Club Escolar R10 - PLE-RD</h1>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:flex md:flex-wrap">
            <Link className="secondary-button border-white bg-transparent text-white hover:bg-white/10" href="/">
              Volver al inicio
            </Link>
            <button className="secondary-button border-white bg-white text-navy hover:bg-skyInstitutional/20" type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">
        {error ? <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div> : null}
        {loading ? <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">Cargando datos...</div> : null}

        {summary ? <SummaryCards summary={summary} /> : null}

        <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
            <input className="field" placeholder="Buscar por nombre, cédula o rol" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="field" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "ALL" | Rol)}>
              <option value="ALL">Todos los roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatRol(role)}
                </option>
              ))}
            </select>
            <select className="field" value={qrFilter} onChange={(event) => setQrFilter(event.target.value as "ALL" | "BLOCKED" | "UNBLOCKED")}>
              <option value="ALL">Todos los QR</option>
              <option value="BLOCKED">Bloqueados</option>
              <option value="UNBLOCKED">Desbloqueados</option>
            </select>
            <button className="primary-button" type="button" onClick={exportExcel}>
              Exportar Excel (.xlsx)
            </button>
          </div>
        </div>

        <RegistrosTable registros={filtered} onToggleQr={toggleQr} onOpenQr={openQr} />
      </section>

      {qrModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-5">
          <div className="w-full max-w-md rounded-md bg-white p-6">
            <h2 className="text-xl font-extrabold text-navy">
              QR de {qrModal.registro.nombre} {qrModal.registro.apellido}
            </h2>
            <img src={qrModal.dataUrl} alt="Código QR" className="mx-auto mt-5 h-72 w-72" />
            <p className="mt-4 break-all rounded-md bg-slate-100 p-3 text-xs text-slate-700">{getQrUrl(qrModal.registro.id)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="secondary-button" type="button" onClick={() => navigator.clipboard.writeText(getQrUrl(qrModal.registro.id))}>
                Copiar URL del QR
              </button>
              <button className="primary-button" type="button" onClick={() => setQrModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SummaryCards({ summary }: { summary: AdminSummary }) {
  const cards = [
    ["Registrados", summary.totalRegistrados],
    ["Check-In", summary.totalCheckIn],
    ["Entradas", summary.totalEntradas],
    ["Salidas", summary.totalSalidas]
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-md border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-navy">{value}</p>
        </div>
      ))}
      <div className="rounded-md border border-slate-200 bg-white p-5 md:col-span-4">
        <h2 className="text-lg font-extrabold text-navy">Resumen por rol</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((role) => {
            const item = summary.porRol[role];
            return (
              <div key={role} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-bold text-navy">{formatRol(role)}</p>
                <p className="mt-1 text-slate-600">
                  {item.registrados} registrados, {item.checkIn} check-in, {item.entradas} entradas, {item.salidas} salidas
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
