"use server";

import { createClient } from "@/server/db/client";
import { generateTaarufCodeSafe } from "@/server/services/sequence";

// Configuration - Make this tunable via env later
const TAARUF_COST_KOIN = parseInt(process.env.TAARUF_COST_KOIN || "5", 10);

/**
 * Business Guards for Ajukan Taaruf
 * Returns validation result with specific error messages
 */
export async function validateTaarufRequest(toUserId: string) {
  try {
    const supabase = await createClient();
    
    // Guard 1: User must be authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        isValid: false,
        error: "Anda harus login terlebih dahulu",
        errorCode: "NOT_AUTHENTICATED",
      };
    }
    
    // Guard 2: CV status must be APPROVED
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("status, candidate_code")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (cvError || !cvData) {
      return {
        isValid: false,
        error: "CV Anda belum dibuat. Silakan lengkapi CV terlebih dahulu.",
        errorCode: "CV_NOT_FOUND",
        redirectTo: "/cv-saya",
      };
    }
    
    if (cvData.status !== "APPROVED") {
      return {
        isValid: false,
        error: `CV Anda dalam status ${cvData.status}. Hanya CV dengan status APPROVED yang dapat mengajukan taaruf.`,
        errorCode: "CV_NOT_APPROVED",
        redirectTo: "/cv-saya",
      };
    }
    
    // Guard 3: Koin balance must be sufficient
    // Use RPC function to get real-time balance from wallet_transactions
    const { data: balanceData, error: balanceError } = await supabase
      .rpc("get_wallet_balance", { p_user_id: user.id });
    
    if (balanceError) {
      console.error("Error getting wallet balance:", balanceError);
      return {
        isValid: false,
        error: "Gagal memeriksa saldo koin Anda",
        errorCode: "BALANCE_CHECK_ERROR",
      };
    }
    
    // Convert cents to koin (100 cents = 1 koin)
    const currentBalance = Math.floor((balanceData || 0) / 100);
    
    if (currentBalance < TAARUF_COST_KOIN) {
      return {
        isValid: false,
        error: `Saldo koin Anda tidak cukup. Dibutuhkan ${TAARUF_COST_KOIN} koin untuk mengajukan taaruf.`,
        errorCode: "INSUFFICIENT_KOIN",
        redirectTo: "/koin-saya",
        requiredKoin: TAARUF_COST_KOIN,
        currentBalance: currentBalance,
      };
    }
    
    // Guard 4: User must not have active taaruf
    const { data: activeTaaruf, error: activeTaarufError } = await supabase
      .from("taaruf_sessions")
      .select("id, taaruf_code")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "ACTIVE")
      .maybeSingle();
    
    if (activeTaarufError) {
      console.error("Error checking active taaruf:", activeTaarufError);
    }
    
    if (activeTaaruf) {
      return {
        isValid: false,
        error: `Anda sedang dalam proses taaruf aktif (${activeTaaruf.taaruf_code}). Selesaikan taaruf ini terlebih dahulu.`,
        errorCode: "ACTIVE_TAARUF_EXISTS",
        redirectTo: "/riwayat-taaruf",
      };
    }
    
    // Guard 5: Cannot request to self
    if (toUserId === user.id) {
      return {
        isValid: false,
        error: "Anda tidak dapat mengajukan taaruf kepada diri sendiri",
        errorCode: "SELF_REQUEST",
      };
    }
    
    // Guard 6: Check if already has pending request to this user
    const { data: existingRequest, error: existingRequestError } = await supabase
      .from("taaruf_requests")
      .select("id, status")
      .eq("from_user", user.id)
      .eq("to_user", toUserId)
      .in("status", ["PENDING", "ACCEPTED"])
      .maybeSingle();
    
    if (existingRequestError) {
      console.error("Error checking existing request:", existingRequestError);
    }
    
    if (existingRequest) {
      const statusText = existingRequest.status === "PENDING" ? "menunggu persetujuan" : "sudah diterima";
      return {
        isValid: false,
        error: `Anda sudah memiliki pengajuan taaruf yang ${statusText} kepada kandidat ini`,
        errorCode: "REQUEST_EXISTS",
      };
    }
    
    // All guards passed
    return {
      isValid: true,
      message: "Validation passed",
    };
    
  } catch (error) {
    console.error("Error validating taaruf request:", error);
    return {
      isValid: false,
      error: "Terjadi kesalahan saat validasi",
      errorCode: "VALIDATION_ERROR",
    };
  }
}

/**
 * Ajukan Taaruf
 * Deducts koin and creates taaruf request
 */
export async function ajukanTaaruf(toUserId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    
    // Validate request with all business guards
    const validation = await validateTaarufRequest(toUserId);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        errorCode: validation.errorCode,
        redirectTo: validation.redirectTo,
      };
    }
    
    // TRANSACTION START: Create request first, then deduct koin
    // IMPORTANT: Must create request BEFORE deducting koin because RLS policy
    // on taaruf_requests checks balance via can_ajukan_taaruf() function
    
    // 1. Create taaruf request (RLS will check balance BEFORE deduction)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours expiry
    
    const { error: requestError } = await supabase
      .from("taaruf_requests")
      .insert({
        from_user: user.id,
        to_user: toUserId,
        status: "PENDING",
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    
    if (requestError) {
      return {
        success: false,
        error: "Gagal membuat pengajuan taaruf. Silakan coba lagi.",
      };
    }
    
    // 2. Deduct koin AFTER request created successfully
    const idempotencyKey = `taaruf-${user.id}-${toUserId}-${Date.now()}`;
    
    const { error: deductError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        type: "DEBIT",
        amount_cents: TAARUF_COST_KOIN * 100, // Convert to cents (5 koin = 500 cents)
        reason: "TAARUF_COST",
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString(),
      });
    
    if (deductError) {
      console.error("Error deducting koin:", deductError);
      
      // Rollback: Delete the request we just created
      await supabase
        .from("taaruf_requests")
        .delete()
        .eq("from_user", user.id)
        .eq("to_user", toUserId)
        .eq("status", "PENDING");
      
      return {
        success: false,
        error: "Gagal mengurangi saldo koin. Pengajuan taaruf dibatalkan.",
      };
    }
    
    return {
      success: true,
      message: `Pengajuan taaruf berhasil dikirim! ${TAARUF_COST_KOIN} koin telah dipotong.`,
      koinDeducted: TAARUF_COST_KOIN,
    };
    
  } catch (error) {
    console.error("Error ajukan taaruf:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create taaruf request",
    };
  }
}

/**
 * Accept Taaruf Request
 * Creates active taaruf session with code
 */
export async function acceptTaarufRequest(requestId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    
    // Get request details
    const { data: request, error: requestError } = await supabase
      .from("taaruf_requests")
      .select("*")
      .eq("id", requestId)
      .eq("to_user", user.id) // Verify this request is for current user
      .eq("status", "PENDING")
      .single();
    
    if (requestError || !request) {
      return {
        success: false,
        error: "Pengajuan taaruf tidak ditemukan atau sudah diproses",
      };
    }
    
    // Check if user already has active taaruf
    const { data: activeTaaruf } = await supabase
      .from("taaruf_sessions")
      .select("id")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "ACTIVE")
      .maybeSingle();
    
    if (activeTaaruf) {
      return {
        success: false,
        error: "Anda sudah memiliki taaruf aktif. Selesaikan terlebih dahulu.",
      };
    }
    
    // Generate taaruf code
    const taarufCode = await generateTaarufCodeSafe();
    
    if (!taarufCode) {
      return {
        success: false,
        error: "Gagal generate kode taaruf. Silakan coba lagi.",
      };
    }
    
    // Create active taaruf session
    const { data: sessionData, error: sessionError} = await supabase
      .from("taaruf_sessions")
      .insert({
        user_a: request.from_user,
        user_b: request.to_user,
        taaruf_code: taarufCode,
        status: "ACTIVE",
      })
      .select()
      .single();
    
    if (sessionError) {
      
      // If error is about RLS policy, provide more helpful message
      if (sessionError.code === '42501' || sessionError.message?.includes('policy')) {
        return {
          success: false,
          error: `RLS Policy Error: ${sessionError.message}. Pastikan RLS policy untuk INSERT di table taaruf_sessions sudah dibuat.`,
        };
      }
      
      return {
        success: false,
        error: `Gagal membuat sesi taaruf: ${sessionError.message || 'Unknown error'}`,
      };
    }
    
    // Update request status to ACCEPTED
    const { error: updateError } = await supabase
      .from("taaruf_requests")
      .update({
        status: "ACCEPTED",
        decided_at: new Date().toISOString(),
      })
      .eq("id", requestId);
    
    // Create notification for stage tracking (Zoom 1 stage)
    // This allows admin kanban to show the taaruf in "Zoom 1" column
    await supabase
      .from("notifications")
      .insert({
        user_id: request.from_user, // Notify User A (sender)
        type: "TAARUF_STAGE_UPDATED",
        title: "Taaruf Diterima",
        message: `Pengajuan Taaruf Anda telah diterima. Kode Taaruf: ${taarufCode}`,
        data: {
          taaruf_id: sessionData.id,
          taaruf_code: taarufCode,
          stage: "Zoom 1",
          request_id: requestId,
        },
      });
    
    return {
      success: true,
      message: `Taaruf berhasil dimulai dengan kode: ${taarufCode}`,
      taarufCode,
    };
    
  } catch (error) {
    console.error("Error accepting taaruf:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept taaruf",
    };
  }
}

/**
 * Reject Taaruf Request
 */
export async function rejectTaarufRequest(requestId: string, rejectReason?: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    
    // Verify request belongs to current user
    const { data: request, error: requestError } = await supabase
      .from("taaruf_requests")
      .select("*")
      .eq("id", requestId)
      .eq("to_user", user.id)
      .eq("status", "PENDING")
      .single();
    
    if (requestError || !request) {
      return {
        success: false,
        error: "Pengajuan taaruf tidak ditemukan atau sudah diproses",
      };
    }
    
    // Update request status to REJECTED
    const { error: updateError } = await supabase
      .from("taaruf_requests")
      .update({
        status: "REJECTED",
        decided_at: new Date().toISOString(),
        reason_reject: rejectReason || null,
      })
      .eq("id", requestId);
    
    if (updateError) {
      console.error("Error rejecting request:", updateError);
      return {
        success: false,
        error: "Gagal menolak pengajuan",
      };
    }
    
    return {
      success: true,
      message: "Pengajuan taaruf berhasil ditolak",
    };
    
  } catch (error) {
    console.error("Error rejecting taaruf:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject taaruf",
    };
  }
}

/**
 * Get Taaruf Requests (CV Masuk - Incoming)
 */
export async function getIncomingRequests() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: null,
      };
    }
    
    const { data: requests, error } = await supabase
      .from("taaruf_requests")
      .select(`
        id,
        from_user,
        status,
        created_at,
        expires_at,
        sender:profiles!taaruf_requests_from_user_fkey (
          user_id,
          full_name,
          gender,
          cv_data!cv_data_user_id_fkey (
            candidate_code,
            birth_date,
            education,
            occupation
          )
        )
      `)
      .eq("to_user", user.id)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: "Failed to fetch requests",
        data: null,
      };
    }
    
    return {
      success: true,
      data: requests,
    };
    
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch requests",
      data: null,
    };
  }
}

/**
 * Get Sent Requests (CV Dikirim - Outgoing)
 */
export async function getSentRequests() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: null,
      };
    }
    
    const { data: requests, error } = await supabase
      .from("taaruf_requests")
      .select(`
        id,
        to_user,
        status,
        created_at,
        expires_at,
        decided_at,
        receiver:profiles!taaruf_requests_to_user_fkey (
          user_id,
          full_name,
          gender,
          cv_data!cv_data_user_id_fkey (
            candidate_code,
            birth_date,
            education,
            occupation
          )
        )
      `)
      .eq("from_user", user.id)
      .in("status", ["PENDING", "ACCEPTED", "REJECTED"])
      .order("created_at", { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: "Failed to fetch requests",
        data: null,
      };
    }
    
    return {
      success: true,
      data: requests,
    };
    
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch requests",
      data: null,
    };
  }
}

/**
 * Get Active Taaruf Sessions
 */
export async function getActiveTaaruf() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: null,
      };
    }
    
    const { data: sessions, error } = await supabase
      .from("taaruf_sessions")
      .select(`
        id,
        taaruf_code,
        user_a,
        user_b,
        status,
        started_at,
        ended_at
      `)
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "ACTIVE")
      .order("started_at", { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: "Failed to fetch active taaruf",
        data: null,
      };
    }

    // Get zoom schedules for each session from notifications
    // TEMPORARY DISABLED FOR DEBUGGING
    if (sessions && sessions.length > 0) {
      try {
        const sessionsWithZoom = await Promise.all(
          sessions.map(async (session) => {
            try {
              // Find zoom schedule notifications for this user
              const { data: zoomNotifications, error: notifError } = await supabase
                .from("notifications")
                .select("data")
                .eq("user_id", user.id)
                .eq("type", "ZOOM_SCHEDULED")
                .order("created_at", { ascending: false });

              if (notifError) {
                console.error("Error fetching zoom notifications:", notifError);
                // Return session without zoom schedules if query fails
                return {
                  ...session,
                  zoom_schedules: [],
                };
              }

              // Extract zoom schedules from notifications data
              const zoom_schedules = zoomNotifications
                ?.filter((notif: any) => notif.data?.taaruf_id && String(notif.data.taaruf_id) === String(session.id))
                .map((notif: any) => ({
                  stage: notif.data.stage,
                  meeting_datetime: notif.data.meeting_datetime,
                  zoom_link: notif.data.zoom_link,
                  notes: notif.data.notes,
                })) || [];

              return {
                ...session,
                zoom_schedules,
              };
            } catch (err) {
              console.error("Error processing zoom schedules for session:", session.id, err);
              // Return session without zoom schedules if error
              return {
                ...session,
                zoom_schedules: [],
              };
            }
          })
        );

        return {
          success: true,
          data: sessionsWithZoom,
        };
      } catch (err) {
        console.error("Error fetching zoom schedules:", err);
        // If zoom schedule query fails, return sessions without schedules
        return {
          success: true,
          data: sessions.map(s => ({ ...s, zoom_schedules: [] })),
        };
      }
    }
    
    return {
      success: true,
      data: sessions || [],
    };
    
  } catch (error) {
    console.error("Error fetching active taaruf:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch active taaruf",
      data: null,
    };
  }
}
