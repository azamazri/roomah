"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess, checkAdminPermission } from "./auth";

/**
 * Validation schemas
 */
const listAccountsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  role: z.enum(["user", "admin", "superadmin"]).optional(),
  status: z.enum(["active", "pending", "suspended", "deleted"]).optional(),
  searchTerm: z.string().max(100).optional(),
});

const updateAccountStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended", "deleted"]),
  reason: z.string().max(500).optional(),
});

const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
});

/**
 * List user accounts
 */
export async function listUserAccounts(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(listAccountsSchema, input, "listUserAccounts");
    const supabase = createServiceClient();

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Filter by admin status if needed
    // if (data.isAdmin !== undefined) {
    //   query = query.eq("is_admin", data.isAdmin);
    // }

    if (data.status) {
      // Map status to is_suspended field
      if (data.status === "suspended") {
        query = query.eq("is_suspended", true);
      } else if (data.status === "active") {
        query = query.eq("is_suspended", false);
      }
    }

    if (data.searchTerm) {
      query = query.or(
        `first_name.ilike.%${data.searchTerm}%,last_name.ilike.%${data.searchTerm}%,email.ilike.%${data.searchTerm}%,phone.ilike.%${data.searchTerm}%`
      );
    }

    const { data: accounts, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw handleDatabaseError(error, "listUserAccounts");
    }

    const accountList = (accounts || []).map((acc) => ({
      id: acc.id,
      email: acc.email,
      phone: acc.phone,
      firstName: acc.first_name,
      lastName: acc.last_name,
      gender: acc.gender,
      isAdmin: acc.is_admin,
      status: acc.is_suspended ? "suspended" : "active",
      otpVerified: acc.otp_verified,
      createdAt: acc.created_at,
      lastLoginAt: acc.last_login_at,
    }));

    return {
      success: true,
      data: {
        accounts: accountList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("List user accounts error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil daftar akun",
      500
    );
  }
}

/**
 * Get detailed account information
 */
export async function getUserDetails(adminId: string, userId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        `*,
        onboarding_verifications (*),
        cv_data:cv_data (count),
        audit_logs:audit_logs!actor_id (count)`
      )
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil pengguna tidak ditemukan",
        404
      );
    }

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from("audit_logs")
      .select("*")
      .or(`actor_id.eq.${userId},entity_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        phone: profile.phone,
        firstName: profile.first_name,
        lastName: profile.last_name,
        gender: profile.gender,
        birthDate: profile.birth_date,
        city: profile.city,
        bio: profile.bio,
        profileImageUrl: profile.profile_image_url,
        isAdmin: profile.is_admin,
        status: profile.is_suspended ? "suspended" : "active",
        otpVerified: profile.otp_verified,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        lastLoginAt: profile.last_login_at,
        deletedAt: profile.deleted_at,
        stats: {
          onboardingSteps: profile.onboarding_verifications?.length || 0,
          cvItems: profile.cv_data?.[0]?.count || 0,
          auditLogCount: profile.audit_logs?.[0]?.count || 0,
        },
        recentActivity: recentActivity || [],
      },
    };
  } catch (error) {
    console.error("Get user details error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil detail akun",
      500
    );
  }
}

/**
 * Update account status (suspend/activate)
 */
export async function updateAccountStatus(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);

    const permission = await checkAdminPermission(adminId, "suspend_user");
    if (!permission.allowed) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        permission.reason || "Tidak memiliki izin",
        403
      );
    }

    const data = validateInput(updateAccountStatusSchema, input, "updateAccountStatus");
    const supabase = createServiceClient();

    // Prevent suspending admins
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", data.userId)
      .single();

    if (targetUser?.is_admin === true) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Tidak bisa mengubah status admin",
        403
      );
    }

    // Update status (map to is_suspended field)
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.status === "suspended") {
      updateData.is_suspended = true;
      updateData.suspension_reason = data.reason || "Ditangguhkan oleh admin";
      updateData.suspended_at = new Date().toISOString();
      updateData.suspended_by = adminId;
    } else if (data.status === "active") {
      updateData.is_suspended = false;
      updateData.suspension_reason = null;
      updateData.suspended_at = null;
      updateData.suspended_by = null;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", data.userId);

    if (updateError) {
      throw handleDatabaseError(updateError, "updateAccountStatus");
    }

    // Log action
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: `account_${data.status}`,
        entity_type: "profiles",
        entity_id: data.userId,
        changes: {
          account_status: data.status,
          reason: data.reason,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: `Akun berhasil di-${data.status === "suspended" ? "suspend" : "aktifkan"}`,
    };
  } catch (error) {
    console.error("Update account status error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengubah status akun",
      500
    );
  }
}

/**
 * Reset user password (admin action)
 */
export async function resetUserPassword(adminId: string, input: unknown) {
  try {
    const permission = await checkAdminPermission(adminId, "suspend_user");
    if (!permission.allowed) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        permission.reason || "Tidak memiliki izin",
        403
      );
    }

    const data = validateInput(resetPasswordSchema, input, "resetUserPassword");
    const supabase = createServiceClient();

    // Update password in auth
    const { error } = await supabase.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });

    if (error) {
      console.error("Error resetting password:", error);
      throw new AppError(
        ERROR_CODES.INTERNAL_ERROR,
        "Gagal mengubah password",
        500
      );
    }

    // Log action
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "password_reset_by_admin",
        entity_type: "profiles",
        entity_id: data.userId,
        changes: { password_reset: true },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: "Password pengguna berhasil diubah",
    };
  } catch (error) {
    console.error("Reset user password error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengubah password",
      500
    );
  }
}

/**
 * View audit log for specific user
 */
export async function viewUserAuditLog(adminId: string, userId: string, limit: number = 20) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .or(`actor_id.eq.${userId},entity_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw handleDatabaseError(error, "viewUserAuditLog");
    }

    const logList = (logs || []).map((log) => ({
      id: log.id,
      actor: log.actor_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      changes: log.changes,
      createdAt: log.created_at,
    }));

    return {
      success: true,
      data: logList,
    };
  } catch (error) {
    console.error("View user audit log error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil audit log",
      500
    );
  }
}
