import { createClient } from "@/server/db/client";

/**
 * TAARUF SERVER ACTIONS - ROOMAH MVP
 * Business logic: Guards, koin deduction, taaruf flow
 */

// ============================================================================
// BUSINESS GUARDS
// ============================================================================

/**
 * Check if user can ajukan taaruf
 * Guards:
 * 1. CV must be APPROVED
 * 2. Must have sufficient koin (5 koin)
 * 3. Not already in active taaruf
 * 4. Not gender sama
 */
async function checkCanAjukanTaaruf(
  fromUserId: string,
  toUserId: string
): Promise<{ canAjukan: boolean; reason?: string }> {
  const supabase = await createClient();

  // Check CV approved
  const { data: fromCv } = await supabase
    .from("cv_data")
    .select("status, gender")
    .eq("user_id", fromUserId)
    .single();

  if (!fromCv || fromCv.status !== "APPROVED") {
    return {
      canAjukan: false,
      reason: "CV Anda belum disetujui admin. Lengkapi dan ajukan CV terlebih dahulu.",
    };
  }

  // Check target CV approved
  const { data: toCv } = await supabase
    .from("cv_data")
    .select("status, gender")
    .eq("user_id", toUserId)
    .single();

  if (!toCv || toCv.status !== "APPROVED") {
    return {
      canAjukan: false,
      reason: "Kandidat ini tidak tersedia untuk taaruf.",
    };
  }

  // Check opposite gender
  if (fromCv.gender === toCv.gender) {
    return {
      canAjukan: false,
      reason: "Taaruf hanya dapat dilakukan dengan lawan jenis.",
    };
  }

  // Check koin balance
  const { data: balance } = await supabase
    .from("wallet_balances_v")
    .select("balance")
    .eq("user_id", fromUserId)
    .single();

  if (!balance || balance.balance < 500) {
    // 500 = 5 koin (1 koin = 100)
    return {
      canAjukan: false,
      reason: "Saldo koin tidak cukup. Minimal 5 koin untuk mengajukan taaruf.",
    };
  }

  // Check active taaruf
  const { data: activeTaaruf } = await supabase
    .from("taaruf_sessions")
    .select("id")
    .or(`user_a.eq.${fromUserId},user_b.eq.${fromUserId}`)
    .eq("status", "ACTIVE")
    .single();

  if (activeTaaruf) {
    return {
      canAjukan: false,
      reason: "Anda sedang dalam proses taaruf aktif. Selesaikan terlebih dahulu.",
    };
  }

  // Check if already sent request to this user
  const { data: existingRequest } = await supabase
    .from("taaruf_requests")
    .select("id")
    .eq("from_user", fromUserId)
    .eq("to_user", toUserId)
    .eq("status", "PENDING")
    .single();

  if (existingRequest) {
    return {
      canAjukan: false,
      reason: "Anda sudah mengajukan taaruf ke kandidat ini. Tunggu respons.",
    };
  }

  return { canAjukan: true };
}

// ============================================================================
// AJUKAN TAARUF
// ============================================================================

/**
 * Ajukan taaruf dengan business guards dan koin deduction
 */
export async function ajukanTaaruf(fromUserId: string, toUserId: string) {
  const supabase = await createClient();

  // Check guards
  const guardResult = await checkCanAjukanTaaruf(fromUserId, toUserId);
  if (!guardResult.canAjukan) {
    return {
      success: false,
      error: guardResult.reason || "Tidak dapat mengajukan taaruf",
      data: null,
    };
  }

  // Start transaction-like operations
  try {
    // 1. Deduct 5 koin (500 cents)
    const { error: ledgerError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: fromUserId,
        type: "DEBIT",
        amount_cents: 500, // 5 koin
        reason: "TAARUF_COST",
        description: `Biaya pengajuan taaruf`,
        created_at: new Date().toISOString(),
      });

    if (ledgerError) {
      throw new Error("Gagal memotong koin: " + ledgerError.message);
    }

    // 2. Create taaruf request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: request, error: requestError} = await supabase
      .from("taaruf_requests")
      .insert({
        from_user: fromUserId,
        to_user: toUserId,
        status: "PENDING",
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      // Rollback: refund koin (simplified for MVP)
      await supabase.from("wallet_transactions").insert({
        user_id: fromUserId,
        type: "CREDIT",
        amount_cents: 500,
        reason: "REFUND",
        description: "Refund gagal ajukan taaruf",
        created_at: new Date().toISOString(),
      });

      throw new Error("Gagal membuat pengajuan: " + requestError.message);
    }

    return {
      success: true,
      data: request,
      error: null,
      message: "Taaruf berhasil diajukan. Koin telah dipotong 5 koin.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengajukan taaruf",
      data: null,
    };
  }
}

// ============================================================================
// GET TAARUF REQUESTS
// ============================================================================

/**
 * Get CV Masuk (incoming requests)
 */
export async function getCvMasuk(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("taaruf_requests")
    .select(
      `
      id,
      from_user,
      to_user,
      status,
      created_at,
      expires_at
    `
    )
    .eq("to_user", userId)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Get CV Dikirim (sent requests)
 */
export async function getCvDikirim(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("taaruf_requests")
    .select(
      `
      id,
      from_user,
      to_user,
      status,
      created_at,
      expires_at
    `
    )
    .eq("from_user", userId)
    .order("created_at", { ascending: false});

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Get Taaruf Aktif (active sessions)
 */
export async function getTaarufAktif(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("taaruf_sessions")
    .select(
      `
      id,
      taaruf_code,
      user_a,
      user_b,
      status,
      started_at,
      ended_at
    `
    )
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq("status", "ACTIVE")
    .order("started_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

// ============================================================================
// RESPOND TO TAARUF REQUEST
// ============================================================================

/**
 * Respond to taaruf request (Accept/Reject)
 */
export async function respondToTaarufRequest(
  userId: string,
  requestId: string,
  response: "ACCEPTED" | "REJECTED",
  rejectionReason?: string
) {
  const supabase = await createClient();

  // Get request details
  const { data: request, error: fetchError } = await supabase
    .from("taaruf_requests")
    .select("*")
    .eq("id", requestId)
    .eq("to_user", userId) // Only recipient can respond
    .eq("status", "PENDING")
    .single();

  if (fetchError || !request) {
    return {
      success: false,
      error: "Pengajuan tidak ditemukan atau sudah direspons",
      data: null,
    };
  }

  // Check expiry
  if (new Date(request.expires_at) < new Date()) {
    // Auto-reject expired request
    await supabase
      .from("taaruf_requests")
      .update({
        status: "REJECTED",
        rejection_reason: "Pengajuan kadaluarsa (7 hari)",
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return {
      success: false,
      error: "Pengajuan telah kadaluarsa",
      data: null,
    };
  }

  if (response === "REJECTED") {
    // Update request status
    const { data, error } = await supabase
      .from("taaruf_requests")
      .update({
        status: "REJECTED",
        rejection_reason: rejectionReason || "Tidak ada alasan",
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return {
      success: true,
      data,
      error: null,
      message: "Pengajuan taaruf ditolak",
    };
  }

  // ACCEPTED - Create taaruf session
  try {
    // 1. Update request status
    await supabase
      .from("taaruf_requests")
      .update({
        status: "ACCEPTED",
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    // 2. Generate taaruf code (call database function)
    const { data: codeResult, error: codeError } = await supabase.rpc(
      "generate_taaruf_code"
    );

    if (codeError) {
      throw new Error("Gagal generate kode taaruf: " + codeError.message);
    }

    const taarufCode = codeResult;

    // 3. Create taaruf session
    const { data: session, error: sessionError } = await supabase
      .from("taaruf_sessions")
      .insert({
        taaruf_code: taarufCode,
        user_a: request.from_user,
        user_b: request.to_user,
        status: "ACTIVE",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error("Gagal membuat sesi taaruf: " + sessionError.message);
    }

    return {
      success: true,
      data: session,
      error: null,
      message: `Taaruf diterima! Kode taaruf: ${taarufCode}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal merespons pengajuan",
      data: null,
    };
  }
}

// ============================================================================
// END TAARUF SESSION
// ============================================================================

/**
 * End taaruf session (optional for MVP)
 */
export async function endTaarufSession(
  userId: string,
  sessionId: string,
  reason: "COMPLETED" | "CANCELLED"
) {
  const supabase = await createClient();

  // Verify user is part of session
  const { data: session, error: fetchError } = await supabase
    .from("taaruf_sessions")
    .select("*")
    .eq("id", sessionId)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq("status", "ACTIVE")
    .single();

  if (fetchError || !session) {
    return {
      success: false,
      error: "Sesi taaruf tidak ditemukan",
      data: null,
    };
  }

  // Update session
  const { data, error } = await supabase
    .from("taaruf_sessions")
    .update({
      status: reason,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data,
    error: null,
    message: "Sesi taaruf telah diakhiri",
  };
}
