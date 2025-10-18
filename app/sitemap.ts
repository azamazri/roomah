// app/sitemap.ts
import { supabaseServer } from "@/lib/supabase/server";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("approved_candidates_v")
    .select("user_id, updated_at")
    .limit(2000); // batasi sesuai kebutuhan

  const pages = (data ?? []).map((r) => ({
    url: `${base}/candidate/${r.user_id}`,
    lastModified: r.updated_at ?? new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pages,
  ];
}
