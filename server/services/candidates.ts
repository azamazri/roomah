"use server";

import { createClient } from "@/server/db/client";

export interface CandidateFilters {
  gender?: "MALE" | "FEMALE";
  minAge?: number;
  maxAge?: number;
  education?: string;
  province?: string;
  provinceId?: number;
  excludeUserId?: string;
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

  // Note: approved_candidates_v doesn't have taaruf_status column
  // So we need to get all candidates first, then filter out those with DALAM_KHITBAH status
  
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

  // Province filter - support both name and ID
  if (filters.province) {
    query = query.eq("province", filters.province);
  } else if (filters.provinceId) {
    // Query by province ID via join (need to check materialized view structure)
    query = query.eq("province_id", filters.provinceId);
  }

  // Exclude current user from results (don't show own profile)
  if (filters.excludeUserId) {
    query = query.neq("user_id", filters.excludeUserId);
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

  // Filter out candidates with DALAM_KHITBAH status
  // Need to fetch taaruf_status from cv_data table
  let filteredData = data || [];
  let adjustedCount = count || 0;
  
  if (filteredData.length > 0) {
    const userIds = filteredData.map((c) => c.user_id);
    
    // Get taaruf_status for all candidates
    const { data: cvStatuses } = await supabase
      .from("cv_data")
      .select("user_id, taaruf_status")
      .in("user_id", userIds);
    
    // Create a map of user_id -> taaruf_status
    const statusMap = new Map(
      cvStatuses?.map((cv) => [cv.user_id, cv.taaruf_status]) || []
    );
    
    // Filter out DALAM_KHITBAH candidates
    const beforeCount = filteredData.length;
    filteredData = filteredData.filter(
      (candidate) => statusMap.get(candidate.user_id) !== "DALAM_KHITBAH"
    );
    const afterCount = filteredData.length;
    
    // Adjust total count
    const removedCount = beforeCount - afterCount;
    adjustedCount = Math.max(0, adjustedCount - removedCount);
  }

  const totalPages = adjustedCount ? Math.ceil(adjustedCount / limit) : 0;

  return {
    candidates: filteredData,
    total: adjustedCount,
    page,
    limit,
    totalPages,
  };
}
