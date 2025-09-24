// server/queries/candidates.ts
import { supabase } from "@/server/db/client";

export type CandidateView = {
  cv_id: string;
  user_id: string;
  candidate_code: string | null;
  gender: "M" | "F" | null;
  avatar_path: string | null;
  full_name: string | null;
  province: string | null;
  city: string | null;
  bio: string | null;
};

export type ListParams = {
  page?: number; // mulai dari 1
  pageSize?: number; // default 12
  q?: string;
  province?: string;
  city?: string;
};

export async function listApprovedCandidates(params: ListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("approved_candidates_v")
    .select("*", { count: "exact" })
    // sort terbaru berdasarkan cv_id (UUID tidak urut waktu; untuk MVP biarkan dulu)
    // Jika nanti ada created_at di view, ganti orderBy tsb.
    .order("cv_id", { ascending: false });

  if (params.q && params.q.trim() !== "") {
    // cari di nama/bio (ilike = case-insensitive)
    query = query
      .ilike("full_name", `%${params.q}%`)
      .ilike("bio", `%${params.q}%`);
  }
  if (params.province && params.province.trim() !== "") {
    query = query.eq("province", params.province);
  }
  if (params.city && params.city.trim() !== "") {
    query = query.eq("city", params.city);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const hasNext = from + (data?.length ?? 0) < total;

  return {
    items: (data ?? []) as CandidateView[],
    page,
    pageSize,
    total,
    hasNext,
  };
}
