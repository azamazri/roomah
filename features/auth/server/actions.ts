/**
 * AUTH SERVER ACTIONS - ROOMAH MVP
 * 
 * Flow Requirements:
 * 1. Register via Google OAuth (NOT email/password for regular users)
 * 2. Redirect to Onboarding: 5Q Verification → CV Wajib → Selesai
 * 3. Login via Google OAuth (existing users) OR email/password (admin only)
 * 4. Admin MUST use email/password (Google OAuth blocked)
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeCvText } from "@/lib/utils/text";
import { 
  onboarding5QSchema, 
  onboardingCvWajibSchema,
  check5QVerification,
  type Onboarding5QInput,
  type OnboardingCvWajibInput
} from "../schemas/onboarding";

// ============================================================================
// GOOGLE OAUTH REGISTRATION & LOGIN
// ============================================================================

/**
 * Handle Google OAuth callback
 * This is called after successful Google authentication
 * 
 * Requirements:
 * - Check if user exists → login
 * - If new user → create profile → redirect to onboarding
 * - Admin cannot register via Google (provider check)
 */
export async function handleGoogleOAuthCallback(googleUser: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Check if user already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("user_id, is_admin, registered_at")
      .eq("email", googleUser.email)
      .single();
    
    if (existingProfile) {
      // Existing user - LOGIN flow
      if (!existingProfile.registered_at) {
        // Has profile but never completed onboarding
        return {
          success: true,
          flow: "onboarding",
          userId: existingProfile.user_id,
          message: "Lanjutkan proses onboarding"
        };
      }
      
      return {
        success: true,
        flow: "login",
        userId: existingProfile.user_id,
        message: "Login berhasil"
      };
    }
    
    // New user - REGISTER flow
    // Create profile with Google data
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        user_id: googleUser.id,
        email: googleUser.email,
        full_name: normalizeCvText(googleUser.name),
        avatar_path: googleUser.picture || null,
        is_admin: false, // Google OAuth users cannot be admin
        registered_at: null, // Will be set after onboarding completion
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error("Failed to create profile:", createError);
      throw new Error("Gagal membuat profil pengguna");
    }
    
    return {
      success: true,
      flow: "register",
      userId: newProfile.user_id,
      message: "Registrasi berhasil. Silakan lanjutkan onboarding."
    };
    
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

/**
 * Admin Login (Email/Password ONLY)
 * Google OAuth is BLOCKED for admin
 */
export async function adminLogin(email: string, password: string) {
  try {
    const supabase = await createClient();
    
    // Authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.user) {
      return {
        success: false,
        error: "Email atau password salah"
      };
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", authData.user.id)
      .single();
    
    if (profileError || !profile?.is_admin) {
      await supabase.auth.signOut(); // Force logout
      return {
        success: false,
        error: "Akun ini bukan admin"
      };
    }
    
    return {
      success: true,
      userId: authData.user.id,
      message: "Login admin berhasil"
    };
    
  } catch (error) {
    console.error("Admin login error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat login"
    };
  }
}

// ============================================================================
// ONBOARDING FLOW
// ============================================================================

/**
 * Step 1: Submit 5Q Verification
 * 
 * Requirements:
 * - 5 questions about readiness for Taaruf
 * - If any answer is negative → show commitment popup
 * - If not committed → reject registration, redirect to Home
 * - If committed OR all positive → proceed to CV step
 */
export async function submit5QVerification(
  userId: string,
  input: Onboarding5QInput
) {
  try {
    const supabase = await createClient();
    
    // Validate input
    const data = onboarding5QSchema.parse(input);
    
    // Check verification result
    const result = check5QVerification(data);
    
    if (!result.passed) {
      // Needs commitment but not committed
      return {
        success: false,
        needsCommitment: true,
        message: "Mohon konfirmasi komitmen Anda untuk melanjutkan"
      };
    }
    
    // Store 5Q data
    const { error: insertError } = await supabase
      .from("onboarding_verifications")
      .upsert({
        user_id: userId,
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        committed: data.committed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Failed to store 5Q verification:", insertError);
      throw new Error("Gagal menyimpan data verifikasi");
    }
    
    return {
      success: true,
      message: "Verifikasi berhasil. Lanjutkan ke pengisian CV.",
      nextStep: "cv"
    };
    
  } catch (error) {
    console.error("5Q verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

/**
 * Save Verification (Alias for submit5QVerification)
 * Used by client components
 */
export async function saveVerification(input: Onboarding5QInput) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }
    
    return await submit5QVerification(user.id, input);
  } catch (error) {
    console.error("Save verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

/**
 * Step 2: Submit CV Wajib (Onboarding)
 * 
 * Requirements:
 * - Jenis Kelamin, Tanggal Lahir, Domisili Provinsi, Pendidikan, Pekerjaan
 * - All text inputs normalized to Capitalize Each Word
 * - Creates cv_data record with status DRAFT
 */
export async function submitOnboardingCvWajib(
  userId: string | null,
  input: OnboardingCvWajibInput
) {
  try {
    const supabase = await createClient();
    
    // Get user from session if userId not provided
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: "Not authenticated. Please login again."
        };
      }
      
      userId = user.id;
    }
    
    // Ensure profile exists (for users created before Option A fix)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile now with registered_at = NULL
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: profileCreateError } = await supabase.from("profiles").insert({
        user_id: userId,
        email: user?.email || "",
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || "User",
        registered_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileCreateError) {
        console.error("Failed to create profile:", profileCreateError);
        throw new Error("Gagal membuat profil");
      }
    }
    
    // Validate input
    const data = onboardingCvWajibSchema.parse(input);
    
    // Normalize occupation text
    const normalizedOccupation = normalizeCvText(data.occupation);
    
    // Update profile with basic data
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        gender: data.gender,
        dob: data.birthDate,
        province_id: data.provinceId,
        education: data.education,
        occupation: normalizedOccupation,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    if (profileError) {
      console.error("Failed to update profile:", profileError);
      throw new Error("Gagal menyimpan data profil");
    }
    
    // Create cv_data record (DRAFT status)
    const { error: cvError } = await supabase
      .from("cv_data")
      .insert({
        user_id: userId,
        status: "DRAFT",
        allow_public: true,
        gender: data.gender,
        full_name: null, // Will be copied from profile
        birth_date: data.birthDate,
        province_id: data.provinceId,
        education: data.education,
        occupation: normalizedOccupation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (cvError) {
      console.error("Failed to create CV:", cvError);
      throw new Error("Gagal membuat CV");
    }
    
    return {
      success: true,
      message: "CV wajib berhasil disimpan",
      nextStep: "selesai"
    };
    
  } catch (error) {
    console.error("Onboarding CV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

/**
 * Step 3: Complete Onboarding (Selesai)
 * 
 * Requirements:
 * - Mark user as registered (set registered_at timestamp)
 * - Redirect to /cv-saya as default landing page
 */
export async function completeOnboarding(userId: string | null) {
  try {
    const supabase = await createClient();
    
    // Get user from session if userId not provided
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: "Not authenticated. Please login again."
        };
      }
      
      userId = user.id;
    }
    
    // Check if 5Q verification exists (REQUIRED)
    const { data: verification, error: verifyError } = await supabase
      .from("onboarding_verifications")
      .select("user_id")
      .eq("user_id", userId)
      .single();
    
    if (verifyError || !verification) {
      return {
        success: false,
        error: "Verifikasi 5Q belum lengkap"
      };
    }
    
    // CV is OPTIONAL - user can skip and fill later
    // Just check, don't block completion
    
    // Mark as registered
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        registered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Failed to complete onboarding:", updateError);
      throw new Error("Gagal menyelesaikan onboarding");
    }
    
    return {
      success: true,
      message: "Selamat! Pendaftaran berhasil diselesaikan.",
      redirect: "/cv-saya"
    };
    
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

/**
 * Get Onboarding Status
 * Check if user has completed 5Q and CV steps
 */
export async function getOnboardingStatus() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }
    
    // Check 5Q verification
    const { data: fiveQ, error: fiveQError } = await supabase
      .from("onboarding_verifications")
      .select("user_id")
      .eq("user_id", user.id)
      .single();
    
    // Check CV data (minimal fields)
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("gender, province_id, education")
      .eq("user_id", user.id)
      .single();
    
    const hasFiveQ = !fiveQError && !!fiveQ;
    const hasCvMinimal = !cvError && !!cvData && !!cvData.gender && !!cvData.province_id && !!cvData.education;
    
    return {
      success: true,
      fiveQ: hasFiveQ,
      cvMinimal: hasCvMinimal
    };
    
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return {
      success: false,
      error: "Failed to get onboarding status"
    };
  }
}

/**
 * Skip CV Wajib (Onboarding)
 * User chooses to skip CV form and complete it later
 */
export async function skipOnboardingCv(userId: string | null) {
  try {
    const supabase = await createClient();
    
    // Get user from session if userId not provided
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return {
          success: false,
          error: "Not authenticated. Please login again."
        };
      }
      
      userId = user.id;
    }
    
    // Still mark as registered but with DRAFT CV
    const { error } = await supabase
      .from("profiles")
      .update({
        registered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    if (error) {
      throw new Error("Gagal menyimpan data");
    }
    
    return {
      success: true,
      message: "Silakan lengkapi CV Anda di halaman CV Saya",
      redirect: "/cv-saya"
    };
    
  } catch (error) {
    console.error("Skip CV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan"
    };
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Logout user
 */
export async function logout() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "Not authenticated" };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (profileError || !profile) {
      return { success: false, error: "Profile not found" };
    }
    
    return {
      success: true,
      profile: {
        userId: profile.user_id,
        email: profile.email,
        fullName: profile.full_name,
        gender: profile.gender,
        isAdmin: profile.is_admin,
        registeredAt: profile.registered_at,
        avatarPath: profile.avatar_path
      }
    };
    
  } catch (error) {
    console.error("Get profile error:", error);
    return { success: false, error: "Failed to get profile" };
  }
}
