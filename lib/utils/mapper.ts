// lib/utils/mapper.ts
import { supabaseServer } from "@/lib/supabase/server";

/** Map nama provinsi -> id (smallint). Mengembalikan null bila tidak ketemu. */
export async function provinceNameToId(name: string): Promise<number | null> {
  const supa = await supabaseServer();
  const { data, error } = await (await supa)
    .from("provinces")
    .select("id")
    .ilike("name", name.trim())
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}
