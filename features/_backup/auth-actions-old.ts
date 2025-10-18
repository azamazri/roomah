"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";

/**
 * Validation schemas
 */
const registerSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  firstName: z.string().min(1, "Nama depan tidak boleh kosong").max(100),
  lastName: z.string().min(1, "Nama belakang tidak boleh kosong").max(100),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "Gender tidak valid" }) }),
});

const loginSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

const requestOtpSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, "OTP harus 6 digit angka"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini tidak boleh kosong"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

/**
 * Register new user
 */
export async function registerUser(input: unknown) {
  try {
    const data = validateInput(registerSchema, input, "registerUser");
    const supabase = createServiceClient();

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .limit(1);

    if (existingEmail && existingEmail.length > 0) {
      throw new AppError(
        ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
        "Email sudah terdaftar",
        409
      );
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", data.phone)
      .limit(1);

    if (existingPhone && existingPhone.length > 0) {
      throw new AppError(
        ERROR_CODES.AUTH_PHONE_ALREADY_EXISTS,
        "Nomor telepon sudah terdaftar",
        409
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
    });

    if (authError || !authData.user) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Gagal membuat akun",
        400,
        { authError: authError?.message }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: data.email,
        phone: data.phone,
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        role: "user",
        account_status: "onboarding",
        otp_verified: false,
      });

    if (profileError) {
      throw handleDatabaseError(profileError, "registerUser - profile creation");
    }

    // Create onboarding verification record
    const { error: onboardingError } = await supabase
      .from("onboarding_verifications")
      .insert({
        profile_id: authData.user.id,
        step: "phone",
        status: "pending",
      });

    if (onboardingError) {
      throw handleDatabaseError(onboardingError, "registerUser - onboarding creation");
    }

    return {
      success: true,
      userId: authData.user.id,
      message: "Pendaftaran berhasil. Silakan verifikasi OTP.",
    };
  } catch (error) {
    console.error("Register error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat pendaftaran",
      500
    );
  }
}

/**
 * Login user
 */
export async function loginUser(input: unknown) {
  try {
    const data = validateInput(loginSchema, input, "loginUser");
    const supabase = createServiceClient();

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Email atau password salah",
        401
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil pengguna tidak ditemukan",
        404
      );
    }

    // Check if OTP verified
    if (!profile.otp_verified) {
      throw new AppError(
        ERROR_CODES.AUTH_OTP_EXPIRED,
        "Silakan verifikasi OTP terlebih dahulu",
        403
      );
    }

    // Check account status
    if (profile.account_status === "suspended") {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Akun Anda telah dibekukan",
        403
      );
    }

    if (profile.account_status === "deleted") {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Akun Anda telah dihapus",
        403
      );
    }

    // Update last login
    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authData.user.id)
      .throwOnError();

    return {
      success: true,
      userId: authData.user.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      accountStatus: profile.account_status,
      role: profile.role,
      session: {
        accessToken: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat login",
      500
    );
  }
}

/**
 * Request OTP
 */
export async function requestOtp(input: unknown) {
  try {
    const data = validateInput(requestOtpSchema, input, "requestOtp");
    const supabase = createServiceClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", data.email)
      .single();

    if (profileError || !profile) {
      // For security, don't reveal if email exists
      return {
        success: true,
        message: "OTP telah dikirim ke email Anda jika terdaftar",
      };
    }

    // Check if OTP already sent recently (rate limiting)
    if (profile.last_otp_sent_at) {
      const lastSent = new Date(profile.last_otp_sent_at);
      const now = new Date();
      const minutesDiff = (now.getTime() - lastSent.getTime()) / 60000;

      if (minutesDiff < 1) {
        throw new AppError(
          ERROR_CODES.RATE_LIMIT_EXCEEDED,
          "Silakan tunggu sebelum meminta OTP baru",
          429
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Send OTP via email/SMS
    // For now, store as plain text (MUST implement email sending in production)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        otp_secret: otp,
        last_otp_sent_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw handleDatabaseError(updateError, "requestOtp");
    }

    console.log(`[DEV] OTP for ${data.email}: ${otp}`);

    return {
      success: true,
      message: "OTP telah dikirim ke email Anda",
    };
  } catch (error) {
    console.error("Request OTP error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat meminta OTP",
      500
    );
  }
}

/**
 * Verify OTP
 */
export async function verifyOtp(input: unknown) {
  try {
    const data = validateInput(verifyOtpSchema, input, "verifyOtp");
    const supabase = createServiceClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", data.email)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil tidak ditemukan",
        404
      );
    }

    // Check if OTP matches
    if (profile.otp_secret !== data.otp) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_OTP,
        "OTP tidak valid",
        401
      );
    }

    // Check if OTP expired (15 minutes)
    if (profile.last_otp_sent_at) {
      const lastSent = new Date(profile.last_otp_sent_at);
      const now = new Date();
      const minutesDiff = (now.getTime() - lastSent.getTime()) / 60000;

      if (minutesDiff > 15) {
        throw new AppError(
          ERROR_CODES.AUTH_OTP_EXPIRED,
          "OTP telah kadaluarsa",
          401
        );
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        otp_verified: true,
        otp_secret: null,
      })
      .eq("id", profile.id);

    if (updateError) {
      throw handleDatabaseError(updateError, "verifyOtp");
    }

    // Update onboarding verification
    await supabase
      .from("onboarding_verifications")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("profile_id", profile.id)
      .eq("step", "phone");

    return {
      success: true,
      message: "OTP berhasil diverifikasi",
    };
  } catch (error) {
    console.error("Verify OTP error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat verifikasi OTP",
      500
    );
  }
}

/**
 * Logout user
 */
export async function logoutUser(userId: string) {
  try {
    const supabase = createServiceClient();

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.admin.signOut(userId);

    if (error) {
      console.error("Logout error:", error);
    }

    return {
      success: true,
      message: "Berhasil logout",
    };
  } catch (error) {
    console.error("Logout error:", error);
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat logout",
      500
    );
  }
}

/**
 * Update password
 */
export async function updatePassword(userId: string, input: unknown) {
  try {
    const data = validateInput(updatePasswordSchema, input, "updatePassword");
    const supabase = createServiceClient();

    // Get user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      throw new AppError(
        ERROR_CODES.AUTH_NOT_AUTHENTICATED,
        "User tidak ditemukan",
        404
      );
    }

    // Verify current password by attempting login
    const { error: loginError } = await supabase.auth.admin.signInWithPassword({
      email: authUser.user.email!,
      password: data.currentPassword,
    });

    if (loginError) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Password saat ini tidak sesuai",
        401
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });

    if (updateError) {
      throw new AppError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Gagal mengubah password",
        400
      );
    }

    return {
      success: true,
      message: "Password berhasil diubah",
    };
  } catch (error) {
    console.error("Update password error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengubah password",
      500
    );
  }
}
