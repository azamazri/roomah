import { createClient } from "@/server/db/client";
import { normalizeCvText, limitArrayItems } from "@/lib/utils/text";
import {
  cvBiodataSchema,
  cvKondisiFisikSchema,
  cvLatarBelakangKeluargaSchema,
  cvIbadahSchema,
  cvKriteriaPasanganSchema,
  cvRencanaPernikahanSchema,
  type CvBiodataInput,
  type CvKondisiFisikInput,
  type CvLatarBelakangKeluargaInput,
  type CvIbadahInput,
  type CvKriteriaPasanganInput,
  type CvRencanaPernikahanInput,
} from "../schemas/cv";

/**
 * CV SERVER ACTIONS - ROOMAH MVP
 * Functions untuk CRUD CV dengan normalisasi Capitalize Each Word
 * Database: cv_data (main) + cv_details (JSONB extended)
 */

// ============================================================================
// GET CV DATA
// ============================================================================

/**
 * Get CV Preview (minimal data + avatar)
 * Returns: CV wajib fields only (untuk Preview tab)
 */
export async function getCvPreview(userId: string) {
  const supabase = createClient();

  const { data: cv, error } = await supabase
    .from("cv_data")
    .select(
      `
      full_name,
      birth_date,
      province_id,
      education,
      occupation,
      avatar_path,
      candidate_code,
      status,
      allow_public,
      admin_note,
      created_at,
      updated_at
    `
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: cv, error: null };
}

/**
 * Get CV Full Data (all 6 categories)
 * Returns: Complete CV untuk Edit tab
 */
export async function getCvFullData(userId: string) {
  const supabase = createClient();

  // Get main CV data
  const { data: cvMain, error: cvError } = await supabase
    .from("cv_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (cvError) {
    return { success: false, error: cvError.message, data: null };
  }

  // Get extended CV details
  const { data: cvDetails, error: detailsError } = await supabase
    .from("cv_details")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (detailsError && detailsError.code !== "PGRST116") {
    // Ignore "not found" error
    return { success: false, error: detailsError.message, data: null };
  }

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
// UPDATE CV - KATEGORI 1: BIODATA LENGKAP
// ============================================================================

export async function updateCvBiodata(
  userId: string,
  data: CvBiodataInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvBiodataSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Normalize text fields
  const updateData = {
    full_name: normalizeCvText(normalized.fullName),
    birth_date: normalized.birthDate,
    marital_status: normalized.maritalStatus,
    full_address: normalizeCvText(normalized.fullAddress),
    province_id: normalized.provinceId,
    education: normalized.education,
    occupation: normalizeCvText(normalized.occupation),
    income_bracket: normalized.incomeBracket,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from("cv_data")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// UPDATE CV - KATEGORI 2: KONDISI FISIK
// ============================================================================

export async function updateCvKondisiFisik(
  userId: string,
  data: CvKondisiFisikInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvKondisiFisikSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Normalize and limit array
  const diseaseHistory = limitArrayItems(
    (normalized.diseaseHistory || []).map((item) => normalizeCvText(item)),
    3
  );

  const updateData = {
    height_cm: normalized.heightCm,
    weight_kg: normalized.weightKg,
    ciri_fisik: normalizeCvText(normalized.ciriFisik),
    disease_history: diseaseHistory,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from("cv_data")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// UPDATE CV - KATEGORI 3: LATAR BELAKANG KELUARGA
// ============================================================================

export async function updateCvKeluarga(
  userId: string,
  data: CvLatarBelakangKeluargaInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvLatarBelakangKeluargaSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Build JSONB object
  const familyBackground = {
    parent_status: normalized.parentStatus,
    parent_occupation: normalizeCvText(normalized.parentOccupation),
    sibling_order: normalized.siblingOrder,
    sibling_total: normalized.siblingTotal,
  };

  // Upsert cv_details
  const { data: result, error } = await supabase
    .from("cv_details")
    .upsert(
      {
        user_id: userId,
        family_background: familyBackground,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// UPDATE CV - KATEGORI 4: IBADAH
// ============================================================================

export async function updateCvIbadah(
  userId: string,
  data: CvIbadahInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvIbadahSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Normalize and limit array
  const otherIbadah = limitArrayItems(
    (normalized.otherIbadah || []).map((item) => normalizeCvText(item)),
    3
  );

  // Build JSONB object
  const worshipProfile = {
    salat_status: normalized.salatStatus,
    quran_ability: normalized.quranAbility,
    fasting: normalizeCvText(normalized.fasting),
    other_ibadah: otherIbadah,
  };

  // Upsert cv_details
  const { data: result, error } = await supabase
    .from("cv_details")
    .upsert(
      {
        user_id: userId,
        worship_profile: worshipProfile,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// UPDATE CV - KATEGORI 5: KRITERIA PASANGAN
// ============================================================================

export async function updateCvKriteria(
  userId: string,
  data: CvKriteriaPasanganInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvKriteriaPasanganSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Normalize and limit array
  let otherCriteria = normalized.otherCriteria || [];
  
  // Default jika kosong
  if (otherCriteria.length === 0) {
    otherCriteria = ["Tidak Ada Kriteria Khusus"];
  } else {
    otherCriteria = limitArrayItems(
      otherCriteria.map((item) => normalizeCvText(item)),
      3
    );
  }

  // Build JSONB object
  const spouseCriteria = {
    age_range: normalizeCvText(normalized.ageRange),
    education: normalized.education || null,
    income_bracket: normalized.incomeBracket || null,
    location: normalizeCvText(normalized.location),
    other_criteria: otherCriteria,
  };

  // Upsert cv_details
  const { data: result, error } = await supabase
    .from("cv_details")
    .upsert(
      {
        user_id: userId,
        spouse_criteria: spouseCriteria,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// UPDATE CV - KATEGORI 6: RENCANA PERNIKAHAN
// ============================================================================

export async function updateCvRencana(
  userId: string,
  data: CvRencanaPernikahanInput
) {
  const supabase = createClient();

  // Validate input
  const validation = cvRencanaPernikahanSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      data: null,
    };
  }

  const normalized = validation.data;

  // Build JSONB object
  const marriagePlan = {
    marriage_year: normalized.marriageYear,
    living_plan: normalizeCvText(normalized.livingPlan),
    vision: normalizeCvText(normalized.vision),
    mission: normalizeCvText(normalized.mission),
  };

  // Upsert cv_details
  const { data: result, error } = await supabase
    .from("cv_details")
    .upsert(
      {
        user_id: userId,
        marriage_plan: marriagePlan,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: result, error: null };
}

// ============================================================================
// CV VISIBILITY & STATUS
// ============================================================================

/**
 * Toggle CV visibility (public/private)
 */
export async function toggleCvVisibility(
  userId: string,
  allowPublic: boolean
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cv_data")
    .update({
      allow_public: allowPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Submit CV for review (DRAFT → REVIEW)
 */
export async function submitCvForReview(userId: string) {
  const supabase = createClient();

  // Check if CV exists and is complete
  const { data: cv, error: checkError } = await supabase
    .from("cv_data")
    .select("status, full_name, birth_date, province_id, education, occupation")
    .eq("user_id", userId)
    .single();

  if (checkError) {
    return {
      success: false,
      error: "CV tidak ditemukan",
      data: null,
    };
  }

  // Validate required fields
  if (
    !cv.full_name ||
    !cv.birth_date ||
    !cv.province_id ||
    !cv.education ||
    !cv.occupation
  ) {
    return {
      success: false,
      error: "CV wajib belum lengkap. Lengkapi data biodata terlebih dahulu.",
      data: null,
    };
  }

  // Only allow submission from DRAFT or REVISI
  if (cv.status !== "DRAFT" && cv.status !== "REVISI") {
    return {
      success: false,
      error: `CV dengan status ${cv.status} tidak dapat diajukan review`,
      data: null,
    };
  }

  // Update status to REVIEW
  const { data, error } = await supabase
    .from("cv_data")
    .update({
      status: "REVIEW",
      admin_note: null, // Clear previous admin notes
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data,
    error: null,
    message: "CV berhasil diajukan untuk verifikasi. Tunggu 1x24 jam.",
  };
}

/**
 * Upload CV Avatar
 */
export async function uploadCvAvatar(
  userId: string,
  file: File
) {
  const supabase = createClient();

  // Validate file
  if (file.size > 1024 * 1024) {
    // 1MB
    return {
      success: false,
      error: "Ukuran file maksimal 1MB",
      data: null,
    };
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Format file harus JPG, PNG, atau WebP",
      data: null,
    };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("cv-avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message, data: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("cv-avatars").getPublicUrl(filePath);

  // Update cv_data
  const { data, error } = await supabase
    .from("cv_data")
    .update({
      avatar_path: filePath,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: { url: publicUrl }, error: null };
}
