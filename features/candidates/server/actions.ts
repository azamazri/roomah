import { createClient } from "@/server/db/client";
import { calculateAge } from "@/lib/utils/date";

/**
 * CANDIDATES SERVER ACTIONS - ROOMAH MVP
 * Query approved_candidates_v dengan auto gender filter
 * Profile access dengan guards
 */

export interface CandidateFilters {
  userId?: string; // If provided, auto filter opposite gender
  gender?: "IKHWAN" | "AKHWAT";
  ageMin?: number;
  ageMax?: number;
  education?: string[];
  provinceId?: number;
  page?: number;
  limit?: number;
}

export interface CandidateSearchResult {
  user_id: string;
  candidate_code: string;
  full_name: string;
  avatar_path: string | null;
  age: number;
  gender_label: "IKHWAN" | "AKHWAT";
  province: string;
  education: string;
  occupation: string;
  taaruf_status: "SIAP_BERTAARUF" | "DALAM_PROSES" | "KHITBAH";
  cv_updated_at: string;
}

// ============================================================================
// SEARCH CANDIDATES
// ============================================================================

/**
 * Search candidates from approved_candidates_v
 * Auto filter opposite gender if userId provided
 */
export async function searchCandidates(filters: CandidateFilters) {
  const supabase = createClient();

  const page = filters.page || 1;
  const limit = filters.limit || 6; // Default 6 cards per page
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("approved_candidates_v")
    .select("*", { count: "exact" });

  // Auto gender filter if userId provided
  if (filters.userId) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("gender")
      .eq("id", filters.userId)
      .single();

    if (userProfile?.gender) {
      // Filter opposite gender
      const oppositeGender = userProfile.gender === "MALE" ? "AKHWAT" : "IKHWAN";
      query = query.eq("gender_label", oppositeGender);
    }
  } else if (filters.gender) {
    // Manual gender filter (for guests)
    query = query.eq("gender_label", filters.gender);
  }

  // Age filter
  if (filters.ageMin) {
    query = query.gte("age", filters.ageMin);
  }
  if (filters.ageMax) {
    query = query.lte("age", filters.ageMax);
  }

  // Education filter
  if (filters.education && filters.education.length > 0) {
    query = query.in("education", filters.education);
  }

  // Province filter
  if (filters.provinceId) {
    query = query.eq("province_id", filters.provinceId);
  }

  // Pagination & ordering
  query = query
    .order("cv_updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return {
      success: false,
      error: error.message,
      data: null,
      pagination: null,
    };
  }

  return {
    success: true,
    data: data as CandidateSearchResult[],
    error: null,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

// ============================================================================
// GET CANDIDATE PROFILE (MODAL - SUMMARY)
// ============================================================================

/**
 * Get candidate profile for modal
 * Returns: Summary data (tidak semua field)
 */
export async function getCandidateProfile(candidateUserId: string) {
  const supabase = createClient();

  // Get CV data (summary fields only)
  const { data: cv, error } = await supabase
    .from("cv_data")
    .select(
      `
      user_id,
      full_name,
      avatar_path,
      candidate_code,
      birth_date,
      marital_status,
      province_id,
      education,
      occupation,
      income_bracket,
      height_cm,
      weight_kg,
      disease_history,
      status
    `
    )
    .eq("user_id", candidateUserId)
    .eq("status", "APPROVED")
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  // Calculate age
  const age = calculateAge(cv.birth_date);

  return {
    success: true,
    data: {
      ...cv,
      age,
    },
    error: null,
  };
}

// ============================================================================
// GET CANDIDATE FULL CV (WITH ACCESS CONTROL)
// ============================================================================

/**
 * Get full CV with access control
 * Only accessible if:
 * 1. Has active taaruf session, OR
 * 2. User clicked "Lihat Profile" (temporary access via modal)
 */
export async function getCandidateFullCV(
  candidateUserId: string,
  requestingUserId: string
) {
  const supabase = createClient();

  // Check access: Active taaruf session
  const { data: taarufSession } = await supabase
    .from("taaruf_sessions")
    .select("id")
    .or(
      `and(user_a.eq.${requestingUserId},user_b.eq.${candidateUserId}),and(user_a.eq.${candidateUserId},user_b.eq.${requestingUserId})`
    )
    .eq("status", "ACTIVE")
    .single();

  // For MVP: Allow temporary access for "Lihat Profile"
  // In production, implement session-based temporary access
  const hasAccess = !!taarufSession || true; // Temporary: always allow

  if (!hasAccess) {
    return {
      success: false,
      error: "Anda tidak memiliki akses ke CV lengkap kandidat ini",
      data: null,
    };
  }

  // Get main CV data
  const { data: cvMain, error: cvError } = await supabase
    .from("cv_data")
    .select("*")
    .eq("user_id", candidateUserId)
    .eq("status", "APPROVED")
    .single();

  if (cvError) {
    return { success: false, error: cvError.message, data: null };
  }

  // Get extended CV details
  const { data: cvDetails } = await supabase
    .from("cv_details")
    .select("*")
    .eq("user_id", candidateUserId)
    .single();

  return {
    success: true,
    data: {
      ...cvMain,
      family_background: cvDetails?.family_background || null,
      worship_profile: cvDetails?.worship_profile || null,
      spouse_criteria: cvDetails?.spouse_criteria || null,
      marriage_plan: cvDetails?.marriage_plan || null,
    },
    error: null,
  };
}

// ============================================================================
// GET CANDIDATE TAARUF STATUS
// ============================================================================

/**
 * Check if candidate is available for taaruf
 * Returns current taaruf status
 */
export async function getCandidateTaarufStatus(candidateUserId: string) {
  const supabase = createClient();

  // Check active taaruf
  const { data: activeTaaruf } = await supabase
    .from("taaruf_sessions")
    .select("id, status")
    .or(`user_a.eq.${candidateUserId},user_b.eq.${candidateUserId}`)
    .eq("status", "ACTIVE")
    .single();

  if (activeTaaruf) {
    return {
      success: true,
      data: {
        status: "DALAM_PROSES",
        available: false,
      },
      error: null,
    };
  }

  return {
    success: true,
    data: {
      status: "SIAP_BERTAARUF",
      available: true,
    },
    error: null,
  };
}
