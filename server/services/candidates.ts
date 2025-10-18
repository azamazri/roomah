"use server";

import { createClient } from "@/server/db/client";

export interface CandidateFilters {
  gender?: "MALE" | "FEMALE";
  minAge?: number;
  maxAge?: number;
  education?: string;
  province?: string;
  page?: number;
  limit?: number;
}

/**
 * List approved candidates with filters and pagination
 */
export async function listApprovedCandidates(filters: CandidateFilters = {}) {
  const supabase = await createClient();
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("approved_candidates_v")
    .select("*", { count: "exact" });

  // Apply filters
  if (filters.gender) {
    query = query.eq("gender_label", filters.gender);
  }

  if (filters.minAge) {
    query = query.gte("age", filters.minAge);
  }

  if (filters.maxAge) {
    query = query.lte("age", filters.maxAge);
  }

  if (filters.education) {
    query = query.eq("education", filters.education);
  }

  if (filters.province) {
    query = query.eq("province", filters.province);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1).order("cv_updated_at", {
    ascending: false,
  });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching candidates:", error);
    return {
      candidates: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return {
    candidates: data || [],
    total: count || 0,
    page,
    limit,
    totalPages,
  };
}
