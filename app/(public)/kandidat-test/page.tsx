// app/(public)/kandidat-test/page.tsx
import { supabase } from "@/server/db/client";

export default async function KandidatTest() {
  const { data, error } = await supabase
    .from("approved_candidates_v")
    .select("*")
    .limit(5);
  return (
    <pre className="p-4 bg-black/5 rounded">
      {JSON.stringify(
        { count: data?.length ?? 0, error: error?.message },
        null,
        2
      )}
    </pre>
  );
}
