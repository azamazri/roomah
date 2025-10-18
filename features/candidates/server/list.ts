"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";

/**
 * Validation schemas
 */
const listCandidatesSchema = z.object({
  limit: z.number().int().positive(\"Limit harus positif\").max(100, \"Maksimal 100 per halaman\").default(10),
  offset: z.number().int().nonnegative(\"Offset tidak boleh negatif\").default(0),
  gender: z.enum([\"male\", \"female\"]).optional(),
  provinceId: z.string().optional(),
  ageMin: z.number().int().min(18, \"Umur minimal 18\").optional(),
  ageMax: z.number().int().max(120, \"Umur maksimal 120\").optional(),
  sortBy: z.enum([\"recent\", \"matched\", \"active\"]).default(\"recent\"),
});

const getCandidateDetailsSchema = z.object({
  candidateId: z.string(),
});

/**
 * Get list of approved candidates
 * This respects RLS policies - only returns non-deleted, approved candidates
 */
export async function listApprovedCandidates(userId: string, input: unknown) {
  try {
    const data = validateInput(listCandidatesSchema, input, \"listApprovedCandidates\");
    const supabase = createServiceClient();

    // Get user's profile for comparison
    const { data: userProfile, error: userError } = await supabase
      .from(\"profiles\")
      .select(\"gender, birth_date, province_id\")
      .eq(\"id\", userId)
      .single();

    if (userError || !userProfile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        \"Profil pengguna tidak ditemukan\",
        404
      );
    }

    // Build query
    let query = supabase
      .from(\"approved_candidates\")
      .select(
        `id,
        profile_id,
        profiles:profile_id (
          id,
          first_name,
          last_name,
          gender,
          birth_date,
          city,
          province_id,
          bio,
          profile_image_url,
          provinces!inner (name)
        )`,
        { count: \"exact\" }
      )
      .neq(\"profile_id\", userId);

    // Apply filters
    if (data.gender) {
      query = query.eq(\"profiles.gender\", data.gender);
    }

    if (data.provinceId) {
      query = query.eq(\"profiles.province_id\", data.provinceId);
    }

    // Age filtering if specified
    if (data.ageMin || data.ageMax) {
      const now = new Date();
      
      if (data.ageMax) {
        const minBirthDate = new Date(now.getFullYear() - data.ageMax, now.getMonth(), now.getDate());
        query = query.lte(\"profiles.birth_date\", minBirthDate.toISOString());
      }
      
      if (data.ageMin) {
        const maxBirthDate = new Date(now.getFullYear() - data.ageMin, now.getMonth(), now.getDate());
        query = query.gte(\"profiles.birth_date\", maxBirthDate.toISOString());
      }
    }

    // Apply sorting
    switch (data.sortBy) {
      case \"recent\":
        query = query.order(\"account_created_at\", { ascending: false });
        break;
      case \"active\":
        query = query.order(\"last_active_at\", { ascending: false });
        break;
      case \"matched\":
        // For matched, would need custom scoring, defaulting to recent
        query = query.order(\"account_created_at\", { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(data.offset, data.offset + data.limit - 1);

    const { data: candidates, error: queryError, count } = await query;

    if (queryError) {
      throw handleDatabaseError(queryError, \"listApprovedCandidates\");
    }

    // Transform response
    const candidatesList = (candidates || []).map((candidate: any) => ({
      id: candidate.profile_id,
      firstName: candidate.profiles?.first_name,
      lastName: candidate.profiles?.last_name,
      gender: candidate.profiles?.gender,
      age: calculateAge(candidate.profiles?.birth_date),
      city: candidate.profiles?.city,
      province: candidate.profiles?.provinces?.name,
      bio: candidate.profiles?.bio,
      profileImageUrl: candidate.profiles?.profile_image_url,
      lastActiveAt: candidate.last_active_at,
      joinedAt: candidate.account_created_at,
    }));

    return {
      success: true,
      data: {
        candidates: candidatesList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error(\"List candidates error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil daftar kandidat\",
      500
    );
  }
}

/**
 * Get detailed profile of a candidate
 */
export async function getCandidateProfile(userId: string, candidateId: string) {
  try {
    const supabase = createServiceClient();

    // Verify candidate is approved
    const { data: candidate, error: candidateError } = await supabase
      .from(\"approved_candidates\")
      .select(\"profile_id\")
      .eq(\"profile_id\", candidateId)
      .single();

    if (candidateError || !candidate) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        \"Kandidat tidak ditemukan\",
        404
      );
    }

    // Get candidate profile
    const { data: profile, error: profileError } = await supabase
      .from(\"profiles\")
      .select(
        `id,
        first_name,
        last_name,
        gender,
        birth_date,
        city,
        province_id,
        bio,
        profile_image_url,
        provinces (name)`,
      )
      .eq(\"id\", candidateId)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        \"Profil kandidat tidak ditemukan\",
        404
      );
    }

    // Get CV data for visible items only
    const { data: cvData, error: cvError } = await supabase
      .from(\"cv_data\")
      .select(\"*\")
      .eq(\"profile_id\", candidateId)
      .eq(\"is_visible\", true)
      .order(\"display_order\", { ascending: true });

    if (cvError) {
      console.error(\"Error fetching CV data:\", cvError);
    }

    // Group CV by category
    const cvByCategory = (cvData || []).reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          id: item.id,
          title: item.title,
          description: item.description,
          data: item.data,
        });
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    return {
      success: true,
      data: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        gender: profile.gender,
        age: calculateAge(profile.birth_date),
        city: profile.city,
        province: (profile.provinces as any)?.name,
        bio: profile.bio,
        profileImageUrl: profile.profile_image_url,
        cv: cvByCategory,
      },
    };
  } catch (error) {
    console.error(\"Get candidate profile error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil profil kandidat\",
      500
    );
  }
}

/**
 * Get list of candidates the user has already sent requests to
 */
export async function getMyTaarufRequests(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: requests, error } = await supabase
      .from(\"taaruf_requests\")
      .select(
        `id,
        to_profile_id,
        status,
        created_at,
        responded_at,
        profiles:to_profile_id (
          first_name,
          last_name,
          profile_image_url,
          gender
        )`,
      )
      .eq(\"from_profile_id\", userId)
      .order(\"created_at\", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, \"getMyTaarufRequests\");
    }

    const requestsList = (requests || []).map((req: any) => ({
      id: req.id,
      candidateId: req.to_profile_id,
      candidateName: `${req.profiles?.first_name} ${req.profiles?.last_name}`,
      profileImageUrl: req.profiles?.profile_image_url,
      status: req.status,
      sentAt: req.created_at,
      respondedAt: req.responded_at,
    }));

    return {
      success: true,
      data: requestsList,
    };
  } catch (error) {
    console.error(\"Get my taaruf requests error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil permintaan taaruf\",
      500
    );
  }
}

/**
 * Get list of incoming taaruf requests
 */
export async function getIncomingTaarufRequests(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: requests, error } = await supabase
      .from(\"taaruf_requests\")
      .select(
        `id,
        from_profile_id,
        status,
        message,
        created_at,
        profiles:from_profile_id (
          first_name,
          last_name,
          profile_image_url,
          gender,
          city
        )`,
      )
      .eq(\"to_profile_id\", userId)
      .eq(\"status\", \"pending\")
      .order(\"created_at\", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, \"getIncomingTaarufRequests\");
    }

    const requestsList = (requests || []).map((req: any) => ({
      id: req.id,
      senderId: req.from_profile_id,
      senderName: `${req.profiles?.first_name} ${req.profiles?.last_name}`,
      profileImageUrl: req.profiles?.profile_image_url,
      gender: req.profiles?.gender,
      city: req.profiles?.city,
      message: req.message,
      receivedAt: req.created_at,
    }));

    return {
      success: true,
      data: requestsList,
    };
  } catch (error) {
    console.error(\"Get incoming taaruf requests error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil permintaan masuk\",
      500
    );
  }
}

/**
 * Get search history or saved candidates (if implemented)
 */
export async function getRecentlyViewedCandidates(userId: string, limit: number = 10) {
  try {
    const supabase = createServiceClient();

    // Note: This would require a separate table to track views
    // For now, returning empty as it's not in the schema
    // TODO: Implement once analytics/tracking is added

    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error(\"Get recently viewed candidates error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil kandidat terbaru\",
      500
    );
  }
}

/**
 * Helper function to calculate age from birth date
 */
function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Batch get candidate profiles (for grid view)
 */
export async function getBatchCandidateProfiles(candidateIds: string[]) {
  try {
    if (candidateIds.length === 0) {
      return { success: true, data: [] };
    }

    const supabase = createServiceClient();

    const { data: profiles, error } = await supabase
      .from(\"approved_candidates\")
      .select(
        `profile_id,
        profiles:profile_id (
          id,
          first_name,
          last_name,
          gender,
          birth_date,
          city,
          profile_image_url
        )`,
      )
      .in(\"profile_id\", candidateIds);

    if (error) {
      throw handleDatabaseError(error, \"getBatchCandidateProfiles\");
    }

    const profilesList = (profiles || []).map((item: any) => ({
      id: item.profiles?.id,
      firstName: item.profiles?.first_name,
      lastName: item.profiles?.last_name,
      gender: item.profiles?.gender,
      age: calculateAge(item.profiles?.birth_date),
      city: item.profiles?.city,
      profileImageUrl: item.profiles?.profile_image_url,
    }));

    return {
      success: true,
      data: profilesList,
    };
  } catch (error) {
    console.error(\"Get batch candidate profiles error:\", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      \"Terjadi kesalahan saat mengambil profil kandidat\",
      500
    );
  }
}
