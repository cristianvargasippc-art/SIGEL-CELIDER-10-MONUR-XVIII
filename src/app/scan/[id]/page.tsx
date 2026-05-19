import { notFound } from "next/navigation";
import ScanPage from "@/components/ScanPage";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export default async function ScanRoutePage({ params }: { params: { id: string } }) {
  const { data, error } = await getSupabaseAdmin()
    .from("registros")
    .select("id,nombre,apellido,rol,centro_educativo,qr_bloqueado,check_in_realizado,entrada_realizada,salida_realizada")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  return <ScanPage initialRegistro={data} />;
}
