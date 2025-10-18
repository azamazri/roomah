"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";

/**
 * Validation schemas
 */
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Nama depan tidak boleh kosong").max(100).optional(),
  lastName: z.string().min(1, "Nama belakang tidak boleh kosong").max(100).optional(),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid").optional(),
  birthDate: z.string().datetime("Format tanggal tidak valid").optional(),
  gender: z.enum(["male", "female"]).optional(),
  city: z.string().max(100).optional(),
  provinceId: z.string().optional(),
  bio: z.string().max(500).optional(),
  profileImageUrl: z.string().url("URL gambar tidak valid").optional(),
});

const updateOnboardingDataSchema = z.object({
  step: z.enum(["phone", "email", "cv_data", "fiveq", "completed"]),
  data: z.record(z.unknown()).optional(),
});

/**
 * Get current user profile
 */
export async function getProfile(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil tidak ditemukan",
        404
      );
    }

    // Get onboarding status
    const { data: onboarding, error: onboardingError } = await supabase
      .from("onboarding_verifications")
      .select("step, status")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (onboardingError) {
      console.error("Error fetching onboarding status:", onboardingError);
    }

    return {
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        phone: profile.phone,
        firstName: profile.first_name,
        lastName: profile.last_name,
        birthDate: profile.birth_date,
        gender: profile.gender,
        profileImageUrl: profile.profile_image_url,
        city: profile.city,
        provinceId: profile.province_id,
        bio: profile.bio,
        isAdmin: profile.is_admin,
        isSuspended: profile.is_suspended,
        otpVerified: profile.otp_verified,
        lastLoginAt: profile.last_login_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        onboarding: onboarding?.map((o) => ({
          step: o.step,
          status: o.status,
        })) || [],
      },
    };
  } catch (error) {
    console.error("Get profile error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil profil",
      500
    );
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, input: unknown) {
  try {
    const data = validateInput(updateProfileSchema, input, "updateProfile");
    const supabase = createServiceClient();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.phone !== undefined) {
      // Check if new phone already exists
      const { data: existingPhone } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", data.phone)
        .neq("id", userId)
        .limit(1);

      if (existingPhone && existingPhone.length > 0) {
        throw new AppError(
          ERROR_CODES.AUTH_PHONE_ALREADY_EXISTS,
          "Nomor telepon sudah digunakan",
          409
        );
      }

      updateData.phone = data.phone;
    }
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.provinceId !== undefined) updateData.province_id = data.provinceId;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profileImageUrl !== undefined) updateData.profile_image_url = data.profileImageUrl;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      throw handleDatabaseError(error, "updateProfile");
    }

    return {
      success: true,
      message: "Profil berhasil diperbarui",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memperbarui profil",
      500
    );
  }
}

/**
 * Update onboarding data and status
 */
export async function updateOnboardingData(userId: string, input: unknown) {
  try {
    const data = validateInput(updateOnboardingDataSchema, input, "updateOnboardingData");
    const supabase = createServiceClient();

    // Get or create onboarding verification record
    const { data: existingRecord, error: fetchError } = await supabase
      .from("onboarding_verifications")
      .select("*")
      .eq("profile_id", userId)
      .eq("step", data.step)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw handleDatabaseError(fetchError, "updateOnboardingData - fetch");
    }

    const onboardingData = data.data || {};

    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("onboarding_verifications")
        .update({
          data: onboardingData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);

      if (updateError) {
        throw handleDatabaseError(updateError, "updateOnboardingData - update");
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("onboarding_verifications")
        .insert({
          profile_id: userId,
          step: data.step,
          status: "pending",
          data: onboardingData,
        });

      if (insertError) {
        throw handleDatabaseError(insertError, "updateOnboardingData - insert");
      }
    }

    return {
      success: true,
      message: `Data ${data.step} berhasil disimpan`,
    };
  } catch (error) {
    console.error("Update onboarding data error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menyimpan data onboarding",
      500
    );
  }
}

/**
 * Get onboarding verification status
 */
export async function getOnboardingStatus(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: records, error } = await supabase
      .from("onboarding_verifications")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, "getOnboardingStatus");
    }

    // Build status map
    const statusMap = new Map<string, (typeof records)[0]>();
    records?.forEach((record) => {
      if (!statusMap.has(record.step)) {
        statusMap.set(record.step, record);
      }
    });

    return {
      success: true,
      data: {
        phone: statusMap.get("phone"),
        email: statusMap.get("email"),
        cvData: statusMap.get("cv_data"),
        fiveq: statusMap.get("fiveq"),
        completed: statusMap.get("completed"),
      },
    };
  } catch (error) {
    console.error("Get onboarding status error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil status onboarding",
      500
    );
  }
}

/**
 * Check if profile is complete for approval
 */
export async function checkProfileCompletion(userId: string) {
  try {
    const supabase = createServiceClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil tidak ditemukan",
        404
      );
    }

    // Check onboarding steps
    const { data: onboarding, error: onboardingError } = await supabase
      .from("onboarding_verifications")
      .select("step, status")
      .eq("profile_id", userId);

    if (onboardingError) {
      throw handleDatabaseError(onboardingError, "checkProfileCompletion");
    }

    // Check CV data
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("id")
      .eq("profile_id", userId);

    if (cvError) {
      throw handleDatabaseError(cvError, "checkProfileCompletion - cv");
    }

    // Determine completion status
    const completion = {
      phoneVerified: onboarding?.some((o) => o.step === "phone" && o.status === "verified") || false,
      emailVerified: onboarding?.some((o) => o.step === "email" && o.status === "verified") || false,
      cvApproved: onboarding?.some((o) => o.step === "cv_data" && o.status === "verified") || false,
      fiveqCompleted: onboarding?.some((o) => o.step === "fiveq" && o.status === "verified") || false,
      hasCvData: (cvData?.length || 0) > 0,
      profileComplete:
        profile.first_name &&
        profile.last_name &&
        profile.birth_date &&
        profile.gender &&
        profile.province_id,
    };

    const isApproved =
      completion.phoneVerified &&
      completion.emailVerified &&
      completion.cvApproved &&
      completion.fiveqCompleted;

    return {
      success: true,
      data: {
        ...completion,
        isApproved,
        missingSteps: [
          !completion.phoneVerified && "phone",
          !completion.emailVerified && "email",
          !completion.cvApproved && "cv_data",
          !completion.fiveqCompleted && "fiveq",
        ].filter(Boolean),
      },
    };
  } catch (error) {
    console.error("Check profile completion error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memeriksa kelengkapan profil",
      500
    );
  }
}

/**
 * Delete user account (soft delete)
 */
export async function deleteAccount(userId: string) {
  try {
    const supabase = createServiceClient();

    // Soft delete: mark as deleted
    const { error } = await supabase
      .from("profiles")
      .update({
        account_status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw handleDatabaseError(error, "deleteAccount");
    }

    // Sign out from auth
    await supabase.auth.admin.signOut(userId);

    return {
      success: true,
      message: "Akun berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete account error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menghapus akun",
      500
    );
  }
}
