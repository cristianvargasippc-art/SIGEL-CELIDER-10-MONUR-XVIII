"use client";

import { FormEvent, useMemo, useState } from "react";
import { AREAS_MESAS_DIRECTIVAS, AREAS_MESAS_DIRECTIVAS_REQUIEREN_COMISION, ROLES, formatRol, type Rol } from "@/lib/types";
import { registroSchema, type RegistroInput } from "@/lib/validation";

type FormState = RegistroInput;
type RegistrationResult = {
  id: string;
  qrDataUrl: string;
  qrUrl: string;
};

const initialState: FormState = {
  nombre: "",
  apellido: "",
  correo: "",
  cedula: "",
  telefono: "",
  edad: 18,
  distrito_educativo: "",
  centro_educativo: "",
  rol: "TECNICOS_DOCENTES",
  area: "",
  comision: ""
};

export default function FormularioRegistro() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const areaIsSelector = form.rol === "MESAS_DIRECTIVAS";
  const commissionIsRequired = form.rol === "MESAS_DIRECTIVAS" && AREAS_MESAS_DIRECTIVAS_REQUIEREN_COMISION.includes(form.area as never);
  const areaHelp = useMemo(() => {
    if (areaIsSelector) return "Seleccione el cargo correspondiente.";
    if (form.rol === "SECRETARIAS_GENERALES" || form.rol === "SUBSECRETARIAS") return "Escriba su cargo dentro del evento.";
    return 'Escriba el área correspondiente. Si no aplica, use "N/A".';
  }, [areaIsSelector, form.rol]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "rol") {
        next.area = value === "MESAS_DIRECTIVAS" ? AREAS_MESAS_DIRECTIVAS[0] : "";
        next.comision = "";
      }
      if (key === "area") {
        next.comision = "";
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setErrors({});
    setResult(null);

    const parsed = registroSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      setStatus("error");
      setMessage("Revise los campos marcados antes de continuar.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const data = (await response.json()) as { ok: boolean; error?: string; id?: string; qrDataUrl?: string; qrUrl?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No se pudo completar el registro.");
      }

      setStatus("success");
      setMessage("Registro completado. Guarde su código QR tomando una captura de pantalla.");
      if (data.id && data.qrDataUrl && data.qrUrl) {
        setResult({ id: data.id, qrDataUrl: data.qrDataUrl, qrUrl: data.qrUrl });
      }
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo completar el registro.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[330px_1fr]">
      <aside className="rounded-md border border-skyInstitutional/40 bg-white p-6">
        <h2 className="text-2xl font-extrabold text-navy">Registro de participantes</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Complete todos los campos obligatorios. El código QR será emitido al finalizar y se habilitará el día del evento.
        </p>
        <div className="mt-6 h-1 w-24 bg-skyInstitutional"></div>
      </aside>

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" value={form.nombre} error={errors.nombre} onChange={(value) => update("nombre", value)} />
          <Input label="Apellido" value={form.apellido} error={errors.apellido} onChange={(value) => update("apellido", value)} />
          <Input label="Correo" type="email" value={form.correo} error={errors.correo} onChange={(value) => update("correo", value)} />
          <Input label="Cédula" value={form.cedula} error={errors.cedula} onChange={(value) => update("cedula", value)} />
          <Input label="Teléfono" value={form.telefono} error={errors.telefono} onChange={(value) => update("telefono", value)} />
          <Input
            label="Edad"
            type="number"
            min={1}
            max={120}
            value={String(form.edad)}
            error={errors.edad}
            onChange={(value) => update("edad", Number(value))}
          />
          <Input
            label="Distrito educativo"
            value={form.distrito_educativo}
            error={errors.distrito_educativo}
            onChange={(value) => update("distrito_educativo", value)}
          />
          <Input
            label="Centro educativo"
            value={form.centro_educativo}
            error={errors.centro_educativo}
            onChange={(value) => update("centro_educativo", value)}
          />

          <div>
            <label className="label" htmlFor="rol">
              Rol
            </label>
            <select id="rol" className="field" value={form.rol} onChange={(event) => update("rol", event.target.value as Rol)} required>
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {formatRol(rol)}
                </option>
              ))}
            </select>
            {errors.rol ? <p className="mt-1 text-sm text-red-700">{errors.rol}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="area">
              Área
            </label>
            {areaIsSelector ? (
              <select id="area" className="field" value={form.area} onChange={(event) => update("area", event.target.value)} required>
                {AREAS_MESAS_DIRECTIVAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            ) : (
              <input id="area" className="field" value={form.area} onChange={(event) => update("area", event.target.value)} required />
            )}
            <p className="mt-1 text-xs text-slate-500">{areaHelp}</p>
            {errors.area ? <p className="mt-1 text-sm text-red-700">{errors.area}</p> : null}
          </div>

          {commissionIsRequired ? (
            <Input label="Comision" value={form.comision} error={errors.comision} onChange={(value) => update("comision", value)} />
          ) : null}
        </div>

        {message ? (
          <div
            className={`mt-5 rounded-md border px-4 py-3 text-sm ${
              status === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            {message}
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-md border border-skyInstitutional bg-[#f4fbff] p-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-skyInstitutional">Código QR generado</p>
            <img src={result.qrDataUrl} alt="Código QR del registro" className="mx-auto mt-4 h-64 w-64 rounded-md border border-slate-200 bg-white p-2" />
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-navy">
              Tome captura de pantalla de este código QR y consérvelo. Será usado para validar su pre-check-in, entrada y salida el día del evento.
            </p>
            <p className="mt-3 break-all rounded-md bg-white px-3 py-2 text-xs text-slate-600">{result.qrUrl}</p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button className="primary-button w-full md:w-auto" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Registrando..." : "Registrar Pre-Check-In"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  type = "text",
  min,
  max
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  min?: number;
  max?: number;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="field" value={value} onChange={(event) => onChange(event.target.value)} type={type} min={min} max={max} required />
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
