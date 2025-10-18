"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess, checkAdminPermission } from "./auth";

/**
 * Validation schemas
 */
const approveCvSchema = z.object({
  userId: z.string(),
  notes: z.string().max(500).optional(),
});

const rejectCvSchema = z.object({
  userId: z.string(),
  reason: z.string().min(10, "Alasan penolakan minimal 10 karakter").max(500),
});

const listPendingCvSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(["recent", "oldest"]).default("recent"),
});

/**
 * List pending CV verifications
 */
export async function listPendingCvVerifications(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(listPendingCvSchema, input, "listPendingCvVerifications");
    const supabase = createServiceClient();

    let query = supabase
      .from("onboarding_verifications")
      .select(
        `*,
        profiles:profile_id (id, first_name, last_name, email, phone)`,
        { count: "exact" }
      )
      .eq("step", "cv_data")
      .eq("status", "pending");

    const order = data.sortBy === "recent" ? false : true;
    query = query.order("created_at", { ascending: order });

    const { data: verifications, error, count } = await query.range(
      data.offset,
      data.offset + data.limit - 1
    );

    if (error) {
      throw handleDatabaseError(error, "listPendingCvVerifications");
    }

    const verificationList = (verifications || []).map((v: any) => ({
      id: v.id,
      userId: v.profile_id,
      userName: `${v.profiles?.first_name} ${v.profiles?.last_name}`,
      email: v.profiles?.email,
      phone: v.profiles?.phone,
      step: v.step,
      status: v.status,
      data: v.data,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }));

    return {
      success: true,
      data: {
        verifications: verificationList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("List pending CV verifications error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil daftar verifikasi CV",
      500
    );
  }
}

/**
 * Get detailed CV verification data
 */
export async function getCvVerificationDetail(adminId: string, userId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get onboarding verification record
    const { data: verification, error: verifyError } = await supabase
      .from("onboarding_verifications")
      .select("*")
      .eq("profile_id", userId)
      .eq("step", "cv_data")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verifyError) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Data verifikasi CV tidak ditemukan",
        404
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Get CV items
    const { data: cvItems } = await supabase
      .from("cv_data")
      .select("*")
      .eq("profile_id", userId)
      .order("display_order", { ascending: true });

    return {
      success: true,
      data: {
        verification: {
          id: verification.id,
          step: verification.step,
          status: verification.status,
          data: verification.data,
          createdAt: verification.created_at,
          updatedAt: verification.updated_at,
        },
        profile: {
          id: profile?.id,
          name: `${profile?.first_name} ${profile?.last_name}`,
          email: profile?.email,
          phone: profile?.phone,
          gender: profile?.gender,
          birthDate: profile?.birth_date,
          city: profile?.city,
        },
        cvItems: (cvItems || []).map((item) => ({
          id: item.id,
          category: item.category,
          title: item.title,
          description: item.description,
          data: item.data,
          displayOrder: item.display_order,
          isVisible: item.is_visible,
        })),
      },
    };
  } catch (error) {
    console.error("Get CV verification detail error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil detail verifikasi CV",
      500
    );
  }
}

/**
 * Approve CV verification
 */
export async function approveCvVerification(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);

    const permission = await checkAdminPermission(adminId, "verify_cv");
    if (!permission.allowed) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        permission.reason || "Tidak memiliki izin",
        403
      );
    }

    const data = validateInput(approveCvSchema, input, "approveCvVerification");
    const supabase = createServiceClient();

    // Update verification status
    const { error: updateError } = await supabase
      .from("onboarding_verifications")
      .update({
        status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", data.userId)
      .eq("step", "cv_data");

    if (updateError) {
      throw handleDatabaseError(updateError, "approveCvVerification");
    }

    // Log action
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "cv_approved",
        entity_type: "onboarding_verifications",
        entity_id: data.userId,
        changes: {
          status: "verified",
          notes: data.notes,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: "CV berhasil diverifikasi",
    };
  } catch (error) {
    console.error("Approve CV verification error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat memverifikasi CV",
      500
    );
  }
}

/**
 * Reject CV verification
 */
export async function rejectCvVerification(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);

    const permission = await checkAdminPermission(adminId, "reject_cv");
    if (!permission.allowed) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        permission.reason || "Tidak memiliki izin",
        403
      );
    }

    const data = validateInput(rejectCvSchema, input, "rejectCvVerification");
    const supabase = createServiceClient();

    // Update verification status
    const { error: updateError } = await supabase
      .from("onboarding_verifications")
      .update({
        status: "rejected",
        data: { rejection_reason: data.reason },
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", data.userId)
      .eq("step", "cv_data");

    if (updateError) {
      throw handleDatabaseError(updateError, "rejectCvVerification");
    }

    // Log action
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "cv_rejected",
        entity_type: "onboarding_verifications",
        entity_id: data.userId,
        changes: {
          status: "rejected",
          reason: data.reason,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: "CV ditolak dengan alasan yang telah disimpan",
    };
  } catch (error) {
    console.error("Reject CV verification error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menolak CV",
      500
    );
  }
}

/**
 * Get CV verification statistics
 */
export async function getCvVerificationStats(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: stats, error } = await supabase
      .rpc("get_cv_verification_stats");

    if (error) {
      console.error("Error fetching CV stats:", error);
      return {
        success: true,
        data: {
          pending: 0,
          verified: 0,
          rejected: 0,
          total: 0,
        },
      };
    }

    return {
      success: true,
      data: stats || {},
    };
  } catch (error) {
    console.error("Get CV verification stats error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil statistik verifikasi CV",
      500
    );
  }
}
