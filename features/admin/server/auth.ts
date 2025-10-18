"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError } from "@/lib/api/error";

/**
 * Verify admin access
 */
export async function verifyAdminAccess(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin, is_suspended")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil tidak ditemukan",
        404
      );
    }

    if (profile.is_admin !== true) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Anda tidak memiliki akses admin",
        403
      );
    }

    if (profile.is_suspended === true) {
      throw new AppError(
        ERROR_CODES.AUTH_ACCOUNT_SUSPENDED,
        "Akun admin Anda ditangguhkan",
        403
      );
    }

    return {
      success: true,
      data: {
        isAdmin: profile.is_admin,
        isSuperAdmin: false, // MVP: no super admin distinction
      },
    };
  } catch (error) {
    console.error("Verify admin access error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat verifikasi akses admin",
      500
    );
  }
}

/**
 * Get admin dashboard access log
 */
export async function getAdminAccessLog(adminId: string, limit: number = 20) {
  try {
    const supabase = createServiceClient();

    // Verify admin access first
    await verifyAdminAccess(adminId);

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("actor_id", adminId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw handleDatabaseError(error, "getAdminAccessLog");
    }

    return {
      success: true,
      data: logs || [],
    };
  } catch (error) {
    console.error("Get admin access log error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil log akses",
      500
    );
  }
}

/**
 * Check admin permission for action
 */
export async function checkAdminPermission(
  adminId: string,
  action: string,
  resource?: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const adminData = await verifyAdminAccess(adminId);

    // Superadmin can do everything
    if (adminData.data.isSuperAdmin) {
      return { allowed: true };
    }

    // Role-based permission mapping
    const adminPermissions: Record<string, string[]> = {
      suspend_user: ["admin", "superadmin"],
      delete_user: ["superadmin"],
      verify_cv: ["admin", "superadmin"],
      reject_cv: ["admin", "superadmin"],
      end_taaruf: ["admin", "superadmin"],
      view_audit_log: ["admin", "superadmin"],
      view_payments: ["admin", "superadmin"],
      generate_reports: ["admin", "superadmin"],
      manage_admins: ["superadmin"],
    };

    const allowed = adminPermissions[action]?.includes("admin") || false;

    if (!allowed) {
      return {
        allowed: false,
        reason: `Anda tidak memiliki izin untuk ${action}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Check admin permission error:", error);
    return { allowed: false, reason: "Gagal memverifikasi izin" };
  }
}
