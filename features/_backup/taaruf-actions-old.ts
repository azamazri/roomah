"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";

/**
 * Validation schemas
 */
const sendTaarufRequestSchema = z.object({
  toProfileId: z.string().min(1, "ID kandidat tidak boleh kosong"),
  message: z.string().max(500, "Pesan maksimal 500 karakter").optional(),
});

const respondTaarufRequestSchema = z.object({
  requestId: z.string().min(1, "ID request tidak boleh kosong"),
  response: z.enum(["accepted", "rejected"], {
    errorMap: () => ({ message: "Response harus 'accepted' atau 'rejected'" }),
  }),
  rejectionReason: z.string().max(200, "Alasan maksimal 200 karakter").optional(),
});

const getTaarufChatSchema = z.object({
  taarufId: z.string().min(1, "ID taaruf tidak boleh kosong"),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

const sendTaarufMessageSchema = z.object({
  taarufId: z.string().min(1, "ID taaruf tidak boleh kosong"),
  message: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
});

const endTaarufSessionSchema = z.object({
  taarufId: z.string().min(1, "ID taaruf tidak boleh kosong"),
  reason: z.string().max(300, "Alasan maksimal 300 karakter").optional(),
});

/**
 * Check if user is eligible for taaruf (helper)
 */
async function checkTaarufEligibility(userId: string): Promise<{ eligible: boolean; reason?: string }> {
  const supabase = createServiceClient();

  // Call database function for eligibility check
  const { data, error } = await supabase.rpc("check_taaruf_eligibility", {
    user_id: userId,
  });

  if (error) {
    console.error("Eligibility check error:", error);
    return { eligible: false, reason: "Gagal melakukan pengecekan kelayakan" };
  }

  if (!data?.eligible) {
    return { eligible: false, reason: data?.reason };
  }

  return { eligible: true };
}

/**
 * Send taaruf request
 */
export async function sendTaarufRequest(userId: string, input: unknown) {
  try {
    const data = validateInput(sendTaarufRequestSchema, input, "sendTaarufRequest");
    const supabase = createServiceClient();

    // Validation: Can't send request to self
    if (data.toProfileId === userId) {
      throw new AppError(
        ERROR_CODES.TAARUF_SELF_REQUEST,
        "Tidak bisa mengirim request ke diri sendiri",
        400
      );
    }

    // Check eligibility
    const eligibility = await checkTaarufEligibility(userId);
    if (!eligibility.eligible) {
      throw new AppError(
        ERROR_CODES.TAARUF_INELIGIBLE,
        eligibility.reason || "Anda tidak lolos syarat untuk taaruf",
        403
      );
    }

    // Check if recipient exists and is approved
    const { data: recipientData, error: recipientError } = await supabase
      .from("approved_candidates")
      .select("profile_id")
      .eq("profile_id", data.toProfileId)
      .single();

    if (recipientError || !recipientData) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Kandidat tidak ditemukan atau belum approved",
        404
      );
    }

    // Check for duplicate pending request
    const { data: existingRequest, error: checkError } = await supabase
      .from("taaruf_requests")
      .select("id")
      .eq("from_profile_id", userId)
      .eq("to_profile_id", data.toProfileId)
      .eq("status", "pending")
      .limit(1);

    if (checkError && checkError.code !== "PGRST116") {
      throw handleDatabaseError(checkError, "sendTaarufRequest - check duplicate");
    }

    if (existingRequest && existingRequest.length > 0) {
      throw new AppError(
        ERROR_CODES.TAARUF_DUPLICATE_REQUEST,
        "Request taaruf sudah pernah dikirim ke kandidat ini",
        409
      );
    }

    // Create taaruf request
    const { data: newRequest, error } = await supabase
      .from("taaruf_requests")
      .insert({
        from_profile_id: userId,
        to_profile_id: data.toProfileId,
        message: data.message || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw handleDatabaseError(error, "sendTaarufRequest");
    }

    return {
      success: true,
      data: {
        requestId: newRequest.id,
        status: newRequest.status,
        createdAt: newRequest.created_at,
      },
      message: "Request taaruf berhasil dikirim",
    };
  } catch (error) {
    console.error("Send taaruf request error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengirim request taaruf",
      500
    );
  }
}

/**
 * Respond to taaruf request
 */
export async function respondToTaarufRequest(userId: string, input: unknown) {
  try {
    const data = validateInput(respondTaarufRequestSchema, input, "respondToTaarufRequest");
    const supabase = createServiceClient();

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("taaruf_requests")
      .select("*")
      .eq("id", data.requestId)
      .eq("to_profile_id", userId)
      .single();

    if (requestError || !request) {
      throw new AppError(
        ERROR_CODES.TAARUF_REQUEST_NOT_FOUND,
        "Request taaruf tidak ditemukan",
        404
      );
    }

    if (request.status !== "pending") {
      throw new AppError(
        ERROR_CODES.TAARUF_REQUEST_ALREADY_RESPONDED,
        `Request sudah di-${request.status}`,
        409
      );
    }

    // Update request status
    const updateData: any = {
      status: data.response,
      responded_at: new Date().toISOString(),
    };

    if (data.response === "rejected" && data.rejectionReason) {
      updateData.rejection_reason = data.rejectionReason;
    }

    const { error: updateError } = await supabase
      .from("taaruf_requests")
      .update(updateData)
      .eq("id", data.requestId);

    if (updateError) {
      throw handleDatabaseError(updateError, "respondToTaarufRequest");
    }

    // If accepted, create taaruf_active record
    if (data.response === "accepted") {
      const { error: activeError } = await supabase
        .from("taaruf_active")
        .insert({
          from_profile_id: request.from_profile_id,
          to_profile_id: userId,
          request_id: data.requestId,
          status: "active",
        });

      if (activeError) {
        console.error("Error creating active taaruf:", activeError);
        // Don't fail the whole operation if active creation fails
      }
    }

    return {
      success: true,
      message: `Request taaruf berhasil di-${data.response === "accepted" ? "terima" : "tolak"}`,
    };
  } catch (error) {
    console.error("Respond to taaruf request error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat merespon request taaruf",
      500
    );
  }
}

/**
 * Get taaruf active session status
 */
export async function getTaarufActiveStatus(userId: string, taarufId: string) {
  try {
    const supabase = createServiceClient();

    const { data: taaruf, error } = await supabase
      .from("taaruf_active")
      .select(
        `*,
        from_profile:from_profile_id (first_name, last_name, profile_image_url),
        to_profile:to_profile_id (first_name, last_name, profile_image_url)`
      )
      .eq("id", taarufId)
      .in("from_profile_id,to_profile_id", [userId, userId])
      .single();

    if (error || !taaruf) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    return {
      success: true,
      data: {
        id: taaruf.id,
        status: taaruf.status,
        fromProfile: {
          id: taaruf.from_profile_id,
          name: `${taaruf.from_profile?.first_name} ${taaruf.from_profile?.last_name}`,
          profileImageUrl: taaruf.from_profile?.profile_image_url,
        },
        toProfile: {
          id: taaruf.to_profile_id,
          name: `${taaruf.to_profile?.first_name} ${taaruf.to_profile?.last_name}`,
          profileImageUrl: taaruf.to_profile?.profile_image_url,
        },
        startedAt: taaruf.created_at,
        endedAt: taaruf.ended_at,
      },
    };
  } catch (error) {
    console.error("Get taaruf active status error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil status taaruf",
      500
    );
  }
}

/**
 * Get taaruf chat history
 */
export async function getTaarufChat(userId: string, input: unknown) {
  try {
    const data = validateInput(getTaarufChatSchema, input, "getTaarufChat");
    const supabase = createServiceClient();

    // Verify user is part of this taaruf session
    const { data: taaruf, error: taarufError } = await supabase
      .from("taaruf_active")
      .select("id")
      .eq("id", data.taarufId)
      .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
      .single();

    if (taarufError || !taaruf) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    // Get messages with pagination
    const { data: messages, error, count } = await supabase
      .from("taaruf_messages")
      .select("*", { count: "exact" })
      .eq("taaruf_id", data.taarufId)
      .order("created_at", { ascending: true })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw handleDatabaseError(error, "getTaarufChat");
    }

    const messageList = (messages || []).map((msg) => ({
      id: msg.id,
      senderId: msg.from_profile_id,
      message: msg.message,
      isRead: msg.is_read,
      createdAt: msg.created_at,
    }));

    return {
      success: true,
      data: {
        messages: messageList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("Get taaruf chat error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil chat history",
      500
    );
  }
}

/**
 * Send message in taaruf session
 */
export async function sendTaarufMessage(userId: string, input: unknown) {
  try {
    const data = validateInput(sendTaarufMessageSchema, input, "sendTaarufMessage");
    const supabase = createServiceClient();

    // Verify user is part of taaruf session
    const { data: taaruf, error: taarufError } = await supabase
      .from("taaruf_active")
      .select("from_profile_id, to_profile_id, status")
      .eq("id", data.taarufId)
      .single();

    if (taarufError || !taaruf) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    if (!([taaruf.from_profile_id, taaruf.to_profile_id].includes(userId))) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Anda tidak berhak mengakses sesi ini",
        403
      );
    }

    if (taaruf.status !== "active") {
      throw new AppError(
        ERROR_CODES.TAARUF_SESSION_ENDED,
        "Sesi taaruf sudah berakhir",
        400
      );
    }

    // Create message
    const { data: newMessage, error } = await supabase
      .from("taaruf_messages")
      .insert({
        taaruf_id: data.taarufId,
        from_profile_id: userId,
        message: data.message,
      })
      .select()
      .single();

    if (error) {
      throw handleDatabaseError(error, "sendTaarufMessage");
    }

    return {
      success: true,
      data: {
        messageId: newMessage.id,
        createdAt: newMessage.created_at,
      },
      message: "Pesan berhasil dikirim",
    };
  } catch (error) {
    console.error("Send taaruf message error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengirim pesan",
      500
    );
  }
}

/**
 * Mark messages as read
 */
export async function markTaarufMessagesAsRead(userId: string, taarufId: string) {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("taaruf_messages")
      .update({ is_read: true })
      .eq("taaruf_id", taarufId)
      .neq("from_profile_id", userId);

    if (error) {
      throw handleDatabaseError(error, "markTaarufMessagesAsRead");
    }

    return {
      success: true,
      message: "Pesan ditandai sudah dibaca",
    };
  } catch (error) {
    console.error("Mark messages as read error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menandai pesan",
      500
    );
  }
}

/**
 * End taaruf session
 */
export async function endTaarufSession(userId: string, input: unknown) {
  try {
    const data = validateInput(endTaarufSessionSchema, input, "endTaarufSession");
    const supabase = createServiceClient();

    // Get taaruf session
    const { data: taaruf, error: taarufError } = await supabase
      .from("taaruf_active")
      .select("*")
      .eq("id", data.taarufId)
      .single();

    if (taarufError || !taaruf) {
      throw new AppError(
        ERROR_CODES.TAARUF_NOT_FOUND,
        "Sesi taaruf tidak ditemukan",
        404
      );
    }

    // Verify user is part of session
    if (![taaruf.from_profile_id, taaruf.to_profile_id].includes(userId)) {
      throw new AppError(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        "Anda tidak berhak mengakhiri sesi ini",
        403
      );
    }

    // Update session to ended
    const { error: updateError } = await supabase
      .from("taaruf_active")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
        end_reason: data.reason || null,
      })
      .eq("id", data.taarufId);

    if (updateError) {
      throw handleDatabaseError(updateError, "endTaarufSession");
    }

    // Log to audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: userId,
        action: "taaruf_ended",
        entity_type: "taaruf_active",
        entity_id: data.taarufId,
        changes: { reason: data.reason },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return {
      success: true,
      message: "Sesi taaruf berhasil diakhiri",
    };
  } catch (error) {
    console.error("End taaruf session error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengakhiri sesi taaruf",
      500
    );
  }
}

/**
 * Get user's active taaruf sessions
 */
export async function getActiveTaarufSessions(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: sessions, error } = await supabase
      .from("taaruf_active")
      .select(
        `*,
        from_profile:from_profile_id (id, first_name, last_name, profile_image_url),
        to_profile:to_profile_id (id, first_name, last_name, profile_image_url)`
      )
      .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, "getActiveTaarufSessions");
    }

    const sessionList = (sessions || []).map((session) => ({
      id: session.id,
      partnerId: session.from_profile_id === userId ? session.to_profile_id : session.from_profile_id,
      partnerName:
        session.from_profile_id === userId
          ? `${session.to_profile?.first_name} ${session.to_profile?.last_name}`
          : `${session.from_profile?.first_name} ${session.from_profile?.last_name}`,
      partnerImage:
        session.from_profile_id === userId
          ? session.to_profile?.profile_image_url
          : session.from_profile?.profile_image_url,
      startedAt: session.created_at,
    }));

    return {
      success: true,
      data: sessionList,
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
 * Get taaruf history (past and current)
 */
export async function getTaarufHistory(userId: string, limit: number = 20) {
  try {
    const supabase = createServiceClient();

    const { data: history, error } = await supabase
      .from("taaruf_requests")
      .select(
        `*,
        from_profile:from_profile_id (first_name, last_name, profile_image_url),
        to_profile:to_profile_id (first_name, last_name, profile_image_url)`
      )
      .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw handleDatabaseError(error, "getTaarufHistory");
    }

    const historyList = (history || []).map((item) => ({
      id: item.id,
      initiatorId: item.from_profile_id,
      initiatorName: `${item.from_profile?.first_name} ${item.from_profile?.last_name}`,
      recipientId: item.to_profile_id,
      recipientName: `${item.to_profile?.first_name} ${item.to_profile?.last_name}`,
      status: item.status,
      message: item.message,
      sentAt: item.created_at,
      respondedAt: item.responded_at,
      rejectionReason: item.rejection_reason,
    }));

    return {
      success: true,
      data: historyList,
    };
  } catch (error) {
    console.error("Get taaruf history error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil history taaruf",
      500
    );
  }
}
