import { createClient } from "@/server/db/client";

/**
 * ADMIN SERVER ACTIONS - ROOMAH MVP
 * CV approval workflow + dashboard + user management
 */

// ============================================================================
// CV VERIFICATION
// ============================================================================

/**
 * Get pending CVs for review
 */
export async function getPendingCVs(adminId: string) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("cv_data")
    .select(
      `
      *,
      profile:profiles!user_id(
        user_id,
        full_name,
        email,
        avatar_path
      )
    `
    )
    .eq("status", "REVIEW")
    .order("updated_at", { ascending: true }); // FIFO

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Approve CV and generate candidate code
 */
export async function approveCV(adminId: string, userId: string) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  try {
    // Get CV data
    const { data: cv } = await supabase
      .from("cv_data")
      .select("status, gender")
      .eq("user_id", userId)
      .single();

    if (!cv || cv.status !== "REVIEW") {
      return {
        success: false,
        error: "CV tidak dalam status review",
        data: null,
      };
    }

    // Generate candidate code
    const { data: codeResult, error: codeError } = await supabase.rpc(
      "generate_candidate_code",
      {
        p_gender: cv.gender,
      }
    );

    if (codeError) {
      throw new Error("Gagal generate kode kandidat: " + codeError.message);
    }

    const candidateCode = codeResult;

    // Update CV status
    const { data: updatedCv, error: updateError } = await supabase
      .from("cv_data")
      .update({
        status: "APPROVED",
        candidate_code: candidateCode,
        admin_note: null, // Clear previous notes
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Gagal approve CV: " + updateError.message);
    }

    // Refresh materialized view (trigger via database function)
    await supabase.rpc("refresh_approved_candidates");

    // Log admin action
    await supabase.from("admin_actions_audit").insert({
      admin_id: adminId,
      action_type: "APPROVE_CV",
      target_user_id: userId,
      details: {
        candidate_code: candidateCode,
      },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      data: updatedCv,
      error: null,
      message: `CV disetujui dengan kode kandidat: ${candidateCode}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal approve CV",
      data: null,
    };
  }
}

/**
 * Revise CV with admin note
 */
export async function reviseCV(
  adminId: string,
  userId: string,
  adminNote: string
) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  // Update CV status
  const { data, error } = await supabase
    .from("cv_data")
    .update({
      status: "REVISI",
      admin_note: adminNote,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  // Log admin action
  await supabase.from("admin_actions_audit").insert({
    admin_id: adminId,
    action_type: "REVISE_CV",
    target_user_id: userId,
    details: {
      admin_note: adminNote,
    },
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    data,
    error: null,
    message: "CV dikembalikan untuk revisi",
  };
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(adminId: string) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("registered_at", "is", null);

    // Pending CVs
    const { count: pendingCVs } = await supabase
      .from("cv_data")
      .select("*", { count: "exact", head: true })
      .eq("status", "REVIEW");

    // Approved CVs
    const { count: approvedCVs } = await supabase
      .from("cv_data")
      .select("*", { count: "exact", head: true })
      .eq("status", "APPROVED");

    // Active taaruf
    const { count: activeTaaruf } = await supabase
      .from("taaruf_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE");

    // Total transactions (success)
    const { count: totalTransactions } = await supabase
      .from("payment_transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "SUCCESS");

    // Weekly registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: weeklyRegistrations } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("registered_at", sevenDaysAgo.toISOString());

    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        pendingCVs: pendingCVs || 0,
        approvedCVs: approvedCVs || 0,
        activeTaaruf: activeTaaruf || 0,
        totalTransactions: totalTransactions || 0,
        weeklyRegistrations: weeklyRegistrations || 0,
      },
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengambil statistik",
      data: null,
    };
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get user list with filters
 */
export async function getUserManagement(
  adminId: string,
  filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("*, cv:cv_data(status, candidate_code)", { count: "exact" });

  // Search filter
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  // Admin filter (if needed)
  // Note: role filter removed - use is_admin boolean instead
  // if (filters?.isAdmin !== undefined) {
  //   query = query.eq("is_admin", filters.isAdmin);
  // }

  // Pagination
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
    error: null,
  };
}

/**
 * Suspend user account
 */
export async function suspendUser(
  adminId: string,
  userId: string,
  reason: string
) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  // Cannot suspend admin
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .single();

  if (targetUser?.is_admin === true) {
    return {
      success: false,
      error: "Tidak dapat menangguhkan akun admin",
      data: null,
    };
  }

  // Update user status (implement suspension logic)
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_suspended: true,
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: adminId,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  // Log admin action
  await supabase.from("admin_actions_audit").insert({
    admin_id: adminId,
    action_type: "SUSPEND_USER",
    target_user_id: userId,
    details: {
      reason,
    },
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    data,
    error: null,
    message: "User berhasil ditangguhkan",
  };
}

/**
 * Reactivate suspended user
 */
export async function reactivateUser(adminId: string, userId: string) {
  const supabase = createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.is_admin !== true) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_suspended: false,
      suspension_reason: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  // Log admin action
  await supabase.from("admin_actions_audit").insert({
    admin_id: adminId,
    action_type: "REACTIVATE_USER",
    target_user_id: userId,
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    data,
    error: null,
    message: "User berhasil diaktifkan kembali",
  };
}
