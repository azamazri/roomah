"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess } from "./auth";

/**
 * Validation schemas
 */
const getActiveTaarufSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  status: z.enum(["active", "suspended", "ended", "all"]).default("active"),
  sortBy: z.enum(["recent", "oldest", "duration"]).default("recent"),
});

const suspendTaarufSessionSchema = z.object({
  taarufId: z.string(),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500),
});

const reportTaarufIssueSchema = z.object({
  taarufId: z.string(),
  issueType: z.enum(["harassment", "inappropriate", "fraud", "other"]),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(1000),
  reportedBy: z.enum(["admin", "user"]),
});

/**
 * Get all active taaruf sessions
 */
export async function getActiveTaarufSessions(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(getActiveTaarufSchema, input, "getActiveTaarufSessions");
    const supabase = createServiceClient();

    let query = supabase
      .from("taaruf_active")
      .select(
        `*,
        from_profile:from_profile_id (first_name, last_name, email),
        to_profile:to_profile_id (first_name, last_name, email)`,
        { count: "exact" }
      );

    if (data.status !== "all") {
      query = query.eq("status", data.status);
    }

    // Apply sorting
    switch (data.sortBy) {
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "duration":
        query = query.order("created_at", { ascending: true }); // Oldest first = longest duration
        break;
    }

    const { data: sessions, error, count } = await query.range(
      data.offset,
      data.offset + data.limit - 1
    );

    if (error) {
      throw handleDatabaseError(error, "getActiveTaarufSessions");
    }

    const sessionList = (sessions || []).map((session: any) => ({
      id: session.id,
      fromUserId: session.from_profile_id,
      fromUserName: `${session.from_profile?.first_name} ${session.from_profile?.last_name}`,
      fromUserEmail: session.from_profile?.email,
      toUserId: session.to_profile_id,
      toUserName: `${session.to_profile?.first_name} ${session.to_profile?.last_name}`,
      toUserEmail: session.to_profile?.email,
      status: session.status,
      startedAt: session.created_at,
      endedAt: session.ended_at,
      endReason: session.end_reason,
    }));

    return {
      success: true,
      data: {
        sessions: sessionList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("Get active taaruf sessions error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil sesi taaruf aktif",
      500
    );
  }
}

/**
 * Get taaruf session detail
 */
export async function getTaarufSessionDetail(adminId: string, taarufId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from("taaruf_active")
      .select(
        `*,
        from_profile:from_profile_id (id, first_name, last_name, email, gender),
        to_profile:to_profile_id (id, first_name, last_name, email, gender)`
      )
      .eq("id", taarufId)
      .single();

    if (sessionError || !session) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    // Get message count
    const { count: messageCount } = await supabase
      .from("taaruf_messages")
      .select("*", { count: "exact", head: true })
      .eq("taaruf_id", taarufId);

    // Get request info
    const { data: request } = await supabase
      .from("taaruf_requests")
      .select("*")
      .eq("id", session.request_id)
      .single();

    return {
      success: true,
      data: {
        id: session.id,
        fromUser: {
          id: session.from_profile?.id,
          name: `${session.from_profile?.first_name} ${session.from_profile?.last_name}`,
          email: session.from_profile?.email,
          gender: session.from_profile?.gender,
        },
        toUser: {
          id: session.to_profile?.id,
          name: `${session.to_profile?.first_name} ${session.to_profile?.last_name}`,
          email: session.to_profile?.email,
          gender: session.to_profile?.gender,
        },
        status: session.status,
        messageCount: messageCount || 0,
        startedAt: session.created_at,
        endedAt: session.ended_at,
        endReason: session.end_reason,
        initialMessage: request?.message,
        duration: session.ended_at
          ? new Date(session.ended_at).getTime() - new Date(session.created_at).getTime()
          : new Date().getTime() - new Date(session.created_at).getTime(),
      },
    };
  } catch (error) {
    console.error("Get taaruf session detail error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil detail sesi taaruf",
      500
    );
  }
}

/**
 * Get taaruf statistics
 */
export async function getTaarufStatistics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get counts
    const { count: activeSessions } = await supabase
      .from("taaruf_active")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: endedSessions } = await supabase
      .from("taaruf_active")
      .select("*", { count: "exact", head: true })
      .eq("status", "ended");

    const { count: suspendedSessions } = await supabase
      .from("taaruf_active")
      .select("*", { count: "exact", head: true })
      .eq("status", "suspended");

    const { count: totalRequests } = await supabase
      .from("taaruf_requests")
      .select("*", { count: "exact", head: true });

    const { count: acceptedRequests } = await supabase
      .from("taaruf_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted");

    const { count: rejectedRequests } = await supabase
      .from("taaruf_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    const totalSessions = (activeSessions || 0) + (endedSessions || 0) + (suspendedSessions || 0);
    const acceptanceRate = totalRequests ? (((acceptedRequests || 0) / totalRequests) * 100).toFixed(1) : 0;

    return {
      success: true,
      data: {
        activeSessions: activeSessions || 0,
        endedSessions: endedSessions || 0,
        suspendedSessions: suspendedSessions || 0,
        totalSessions: totalSessions,
        totalRequests: totalRequests || 0,
        acceptedRequests: acceptedRequests || 0,
        rejectedRequests: rejectedRequests || 0,
        acceptanceRate: parseFloat(acceptanceRate as string),
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Get taaruf statistics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil statistik taaruf",
      500
    );
  }
}

/**
 * Suspend taaruf session (admin intervention)
 */
export async function suspendTaarufSession(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(suspendTaarufSessionSchema, input, "suspendTaarufSession");
    const supabase = createServiceClient();

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from("taaruf_active")
      .select("*")
      .eq("id", data.taarufId)
      .single();

    if (sessionError || !session) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    // Suspend session
    const { error: updateError } = await supabase
      .from("taaruf_active")
      .update({
        status: "suspended",
        ended_at: new Date().toISOString(),
        end_reason: `Admin suspended: ${data.reason}`,
      })
      .eq("id", data.taarufId);

    if (updateError) {
      throw handleDatabaseError(updateError, "suspendTaarufSession");
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "taaruf_suspended",
        entity_type: "taaruf_active",
        entity_id: data.taarufId,
        changes: {
          status: "suspended",
          reason: data.reason,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: "Sesi taaruf berhasil disuspend",
    };
  } catch (error) {
    console.error("Suspend taaruf session error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengsuspend sesi taaruf",
      500
    );
  }
}

/**
 * Report taaruf issue (for disputes/moderation)
 */
export async function reportTaarufIssue(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(reportTaarufIssueSchema, input, "reportTaarufIssue");
    const supabase = createServiceClient();

    // Create issue report
    const { data: report, error: reportError } = await supabase
      .from("taaruf_issues")
      .insert({
        taaruf_id: data.taarufId,
        issue_type: data.issueType,
        description: data.description,
        reported_by: data.reportedBy,
        status: "open",
      })
      .select()
      .single();

    if (reportError) {
      throw handleDatabaseError(reportError, "reportTaarufIssue");
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "taaruf_issue_reported",
        entity_type: "taaruf_issues",
        entity_id: report?.id,
        changes: {
          issueType: data.issueType,
          description: data.description,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      data: {
        reportId: report?.id,
      },
      message: "Laporan issue berhasil dibuat",
    };
  } catch (error) {
    console.error("Report taaruf issue error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat membuat laporan issue",
      500
    );
  }
}

/**
 * Get taaruf issues/reports
 */
export async function getTaarufIssues(adminId: string, limit: number = 20) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: issues, error } = await supabase
      .from("taaruf_issues")
      .select(
        `*,
        taaruf:taaruf_id (from_profile_id, to_profile_id)`
      )
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === "42P01") {
        return {
          success: true,
          data: [],
        };
      }
      throw handleDatabaseError(error, "getTaarufIssues");
    }

    const issueList = (issues || []).map((issue: any) => ({
      id: issue.id,
      taarufId: issue.taaruf_id,
      issueType: issue.issue_type,
      description: issue.description,
      reportedBy: issue.reported_by,
      status: issue.status,
      createdAt: issue.created_at,
    }));

    return {
      success: true,
      data: issueList,
    };
  } catch (error) {
    console.error("Get taaruf issues error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil laporan issue",
      500
    );
  }
}

/**
 * Get taaruf analytics
 */
export async function getTaarufAnalytics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get all taaruf sessions for analysis
    const { data: allSessions } = await supabase
      .from("taaruf_active")
      .select(
        `*,
        from_profile:from_profile_id (gender),
        to_profile:to_profile_id (gender, province_id)`
      );

    const analytics = {
      byGenderCombination: {} as Record<string, number>,
      averageSessionDuration: 0,
      completionRate: 0,
      totalSessions: (allSessions || []).length,
      endedSessions: 0,
      activeSessions: 0,
      suspendedSessions: 0,
    };

    let totalDuration = 0;
    let endedCount = 0;

    (allSessions || []).forEach((session: any) => {
      const genderPair = `${session.from_profile?.gender} - ${session.to_profile?.gender}`;
      analytics.byGenderCombination[genderPair] = (analytics.byGenderCombination[genderPair] || 0) + 1;

      if (session.status === "ended") {
        analytics.endedSessions++;
        endedCount++;
        if (session.ended_at && session.created_at) {
          totalDuration += new Date(session.ended_at).getTime() - new Date(session.created_at).getTime();
        }
      } else if (session.status === "active") {
        analytics.activeSessions++;
      } else if (session.status === "suspended") {
        analytics.suspendedSessions++;
      }
    });

    analytics.averageSessionDuration = endedCount > 0 ? Math.round(totalDuration / endedCount / 1000 / 60) : 0; // in minutes
    analytics.completionRate = analytics.totalSessions > 0
      ? ((analytics.endedSessions / analytics.totalSessions) * 100).toFixed(1)
      : 0;

    return {
      success: true,
      data: analytics,
    };
  } catch (error) {
    console.error("Get taaruf analytics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil analytics taaruf",
      500
    );
  }
}
