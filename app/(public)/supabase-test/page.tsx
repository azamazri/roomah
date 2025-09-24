// app/(public)/supabase-test/page.tsx
import { supabase } from "@/server/db/client";

export default async function SupabaseTest() {
  const { data, error } = await supabase
    .from("_unknown_table_")
    .select("*")
    .limit(1);
  return (
    <pre className="p-4 bg-black/5 rounded">
      {JSON.stringify({ ok: !error, error: error?.message, data }, null, 2)}
    </pre>
  );
}
