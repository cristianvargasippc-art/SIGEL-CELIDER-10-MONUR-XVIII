"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret })
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No autorizado");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No autorizado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-navy px-5 py-8 md:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] md:items-center md:gap-10 md:px-12">
      <section className="mx-auto hidden max-w-2xl text-white md:block">
        <img src="/imagenes/logo.png" alt="Logo Club Escolar R10" className="h-auto w-full max-w-[280px] object-contain" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-skyInstitutional">Ministerio de Educación - PLE-RD</p>
        <h1 className="mt-3 text-5xl font-extrabold">Panel administrativo</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-blue-50">
          Gestión de registros, códigos QR, check-in, entrada, salida y exportación oficial del evento Club Escolar R10.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-md bg-white p-5 shadow-lg sm:p-7">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <img src="/imagenes/logo.png" alt="Logo Club Escolar R10" className="h-20 w-20 object-contain sm:h-16 sm:w-16" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-skyInstitutional">Acceso seguro</p>
            <h1 className="text-2xl font-extrabold text-navy">Administración</h1>
          </div>
        </div>
        <div className="mt-7">
          <label className="label" htmlFor="secret">
            Contraseña
          </label>
          <input id="secret" className="field" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} required />
        </div>
        {error ? <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div> : null}
        <button className="primary-button mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Validando..." : "Entrar al panel"}
        </button>
        <Link className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-navy hover:underline" href="/">
          Volver al inicio
        </Link>
      </form>
    </main>
  );
}
