import FormularioRegistro from "@/components/FormularioRegistro";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f9fc]">
      <section className="border-b border-skyInstitutional/35 bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_minmax(180px,280px)] md:items-center">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-skyInstitutional">Ministerio de Educación - PLE-RD</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-normal sm:text-5xl">Club Escolar R10</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-50">
              Registro oficial de participantes para el proceso de pre-check-in, acreditación, entrada y salida del evento educativo.
            </p>
            <Link
              className="mt-6 inline-flex rounded-md border border-skyInstitutional px-4 py-2 text-sm font-bold text-white transition hover:bg-skyInstitutional/20"
              href="/admin/login"
            >
              Panel administrativo
            </Link>
          </div>
          <div className="flex justify-center md:justify-end">
            <img src="/imagenes/logo.png" alt="Logo Club Escolar R10" className="h-auto w-[min(72vw,260px)] object-contain md:w-full md:max-w-[280px]" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <FormularioRegistro />
      </section>
    </main>
  );
}
