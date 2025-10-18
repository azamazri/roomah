"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError } from "@/lib/api/error";
import { verifyAdminAccess } from "./auth";

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .neq("role", "admin")
      .neq("role", "superadmin");

    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("last_login_at", sevenDaysAgo)
      .neq("role", "admin");

    // Get new registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newRegistrations } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("created_at", thirtyDaysAgo);

    // Get approved candidates
    const { count: approvedCandidates } = await supabase
      .from("approved_candidates")
      .select("*", { count: "exact", head: true });

    // Get pending onboarding
    const { count: pendingOnboarding } = await supabase
      .from("onboarding_verifications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get active taaruf sessions
    const { count: activeTaaruf } = await supabase
      .from("taaruf_active")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get payment stats
    const { data: paymentStats } = await supabase
      .rpc("get_payment_statistics");

    return {
      success: true,
      data: {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          newThisMonth: newRegistrations || 0,
        },
        candidates: {
          approved: approvedCandidates || 0,
          pendingVerification: pendingOnboarding || 0,
        },
        taaruf: {
          activeSessions: activeTaaruf || 0,
        },
        payments: paymentStats || {
          totalRevenue: 0,
          totalTransactions: 0,
          pendingPayments: 0,
        },
      },
    };
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil metrik dashboard",
      500
    );
  }
}

/**
 * Get recent activities
 */
export async function getRecentActivities(adminId: string, limit: number = 10) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: activities, error } = await supabase
      .from("audit_logs")
      .select(
        `*,
        profiles:actor_id (first_name, last_name)`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw handleDatabaseError(error, "getRecentActivities");
    }

    const activitiesList = (activities || []).map((act: any) => ({
      id: act.id,
      actor: `${act.profiles?.first_name} ${act.profiles?.last_name}`,
      action: act.action,
      entityType: act.entity_type,
      entityId: act.entity_id,
      changes: act.changes,
      createdAt: act.created_at,
    }));

    return {
      success: true,
      data: activitiesList,
    };
  } catch (error) {
    console.error("Get recent activities error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil aktivitas terbaru",
      500
    );
  }
}

/**
 * Get system health status
 */
export async function getSystemHealth(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Check database connectivity
    const { data: dbHealth, error: dbError } = await supabase
      .rpc("ping");

    const isHealthy = !dbError;

    // Get error logs from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentErrors } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("action", "error")
      .gt("created_at", oneHourAgo);

    return {
      success: true,
      data: {
        database: {
          status: isHealthy ? "healthy" : "unhealthy",
          lastCheck: new Date().toISOString(),
        },
        recentErrors: recentErrors || 0,
        overallStatus: isHealthy && (recentErrors || 0) < 5 ? "healthy" : "degraded",
      },
    };
  } catch (error) {
    console.error("Get system health error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil status sistem",
      500
    );
  }
}

/**
 * Get user growth metrics (last 30 days)
 */
export async function getUserGrowthMetrics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get daily signups for last 30 days
    const { data: dailyStats, error } = await supabase
      .rpc("get_daily_signup_stats", { days: 30 });

    if (error) {
      console.error("Error fetching growth stats:", error);
      return {
        success: true,
        data: {
          dailyStats: [],
          trend: "neutral",
        },
      };
    }

    return {
      success: true,
      data: {
        dailyStats: dailyStats || [],
        trend: determineTrend(dailyStats),
      },
    };
  } catch (error) {
    console.error("Get user growth metrics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil metrik pertumbuhan",
      500
    );
  }
}

/**
 * Get approval rate statistics
 */
export async function getApprovalRateStats(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get CV verification stats
    const { data: cvStats, error: cvError } = await supabase
      .rpc("get_cv_verification_stats");

    // Get taaruf request stats
    const { count: taarufAccepted } = await supabase
      .from("taaruf_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted");

    const { count: taarufTotal } = await supabase
      .from("taaruf_requests")
      .select("*", { count: "exact", head: true });

    if (cvError) {
      console.error("Error fetching CV stats:", cvError);
    }

    return {
      success: true,
      data: {
        cv: {
          approved: cvStats?.verified || 0,
          rejected: cvStats?.rejected || 0,
          pending: cvStats?.pending || 0,
          total: cvStats?.total || 0,
          approvalRate: cvStats?.total ? ((cvStats.verified / cvStats.total) * 100).toFixed(1) : 0,
        },
        taaruf: {
          accepted: taarufAccepted || 0,
          total: taarufTotal || 0,
          acceptanceRate: taarufTotal ? (((taarufAccepted || 0) / taarufTotal) * 100).toFixed(1) : 0,
        },
      },
    };
  } catch (error) {
    console.error("Get approval rate stats error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil statistik approval",
      500
    );
  }
}

/**
 * Helper: Determine growth trend
 */
function determineTrend(dailyStats: any[]): "up" | "down" | "neutral" {
  if (!dailyStats || dailyStats.length < 2) {
    return "neutral";
  }

  const firstHalf = dailyStats.slice(0, Math.floor(dailyStats.length / 2)).reduce((sum, d) => sum + (d.count || 0), 0);
  const secondHalf = dailyStats.slice(Math.floor(dailyStats.length / 2)).reduce((sum, d) => sum + (d.count || 0), 0);

  if (secondHalf > firstHalf) {
    return "up";
  } else if (secondHalf < firstHalf) {
    return "down";
  }

  return "neutral";
}

/**
 * Generate admin report (summary)
 */
export async function generateAdminReport(adminId: string) {
  try {
    await verifyAdminAccess(adminId);

    // Fetch all necessary data
    const metrics = await getDashboardMetrics(adminId);
    const activities = await getRecentActivities(adminId, 5);
    const health = await getSystemHealth(adminId);
    const approvalStats = await getApprovalRateStats(adminId);

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        metrics: metrics.data,
        recentActivities: activities.data,
        systemHealth: health.data,
        approvalStats: approvalStats.data,
      },
      message: "Laporan berhasil dibuat",
    };
  } catch (error) {
    console.error("Generate admin report error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat membuat laporan",
      500
    );
  }
}
