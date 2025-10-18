"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import crypto from "crypto";

/**
 * Validation schemas
 */
const initiateTopupSchema = z.object({
  amount: z.number().int().positive("Jumlah harus positif").min(10000, "Minimum topup 10.000"),
  paymentMethod: z.enum(["card", "bank_transfer", "e_wallet"], {
    errorMap: () => ({ message: "Metode pembayaran tidak valid" }),
  }),
});

const verifyMidtransCallbackSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
});

const getWalletHistorySchema = z.object({
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
  type: z.enum(["topup", "spend", "refund", "all"]).default("all"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const debitWalletSchema = z.object({
  amount: z.number().int().positive("Jumlah harus positif"),
  reason: z.string().min(1, "Alasan tidak boleh kosong"),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.enum(["taaruf", "feature", "other"]).optional(),
});

/**
 * Helper: Calculate wallet balance
 */
async function calculateWalletBalance(userId: string): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .rpc("calculate_wallet_balance", { user_id: userId });

  if (error) {
    console.error("Error calculating balance:", error);
    return 0;
  }

  return data || 0;
}

/**
 * Helper: Generate Midtrans order ID
 */
function generateOrderId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ROOMAH-${userId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Helper: Generate Midtrans signature
 */
function generateMidtransSignature(orderId: string, grossAmount: number, serverKey: string): string {
  const key = `${orderId}${grossAmount}${serverKey}`;
  return crypto.createHash("sha512").update(key).digest("hex");
}

/**
 * Initiate topup request
 */
export async function initiateTopup(userId: string, input: unknown) {
  try {
    const data = validateInput(initiateTopupSchema, input, "initiateTopup");
    const supabase = createServiceClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new AppError(
        ERROR_CODES.PROFILE_NOT_FOUND,
        "Profil pengguna tidak ditemukan",
        404
      );
    }

    // Generate order ID
    const orderId = generateOrderId(userId);

    // Create pending transaction record
    const { data: transaction, error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        profile_id: userId,
        type: "topup",
        amount: data.amount,
        status: "pending",
        payment_method: data.paymentMethod,
        order_id: orderId,
        notes: `Topup via ${data.paymentMethod}`,
      })
      .select()
      .single();

    if (txError) {
      throw handleDatabaseError(txError, "initiateTopup - create transaction");
    }

    // Generate Snap token (production implementation)
    // In real implementation, call Midtrans Snap API
    // For now, return mock structure
    const snapToken = `${orderId}-${Buffer.from(orderId).toString("base64")}`;

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        orderId: orderId,
        amount: data.amount,
        snapToken: snapToken,
        paymentMethod: data.paymentMethod,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      message: "Permintaan topup berhasil dibuat",
    };
  } catch (error) {
    console.error("Initiate topup error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat membuat permintaan topup",
      500
    );
  }
}

/**
 * Verify Midtrans callback
 */
export async function verifyMidtransCallback(callbackData: unknown) {
  try {
    const data = validateInput(verifyMidtransCallbackSchema, callbackData, "verifyMidtransCallback");
    const supabase = createServiceClient();

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new AppError(
        ERROR_CODES.INTERNAL_ERROR,
        "Server tidak terkonfigurasi dengan benar",
        500
      );
    }

    const expectedSignature = generateMidtransSignature(
      data.order_id,
      parseInt(data.gross_amount),
      serverKey
    );

    if (data.signature_key !== expectedSignature) {
      console.error("Invalid Midtrans signature");
      throw new AppError(
        ERROR_CODES.PAYMENT_INVALID_SIGNATURE,
        "Signature tidak valid",
        400
      );
    }

    // Extract userId from order_id
    // Format: ROOMAH-{userId}-{timestamp}-{random}
    const orderParts = data.order_id.split("-");
    const encodedUserId = orderParts[1];
    // In real implementation, decode the userId properly

    // Find transaction
    const { data: transaction, error: txError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("order_id", data.order_id)
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found:", data.order_id);
      return { success: false, message: "Transaction not found" };
    }

    // Map Midtrans transaction status
    let transactionStatus = "pending";
    if (data.transaction_status === "capture" || data.status_code === "200") {
      transactionStatus = "completed";
    } else if (data.transaction_status === "settlement") {
      transactionStatus = "completed";
    } else if (data.transaction_status === "deny" || data.status_code === "202") {
      transactionStatus = "rejected";
    } else if (data.transaction_status === "cancel" || data.transaction_status === "expire") {
      transactionStatus = "failed";
    }

    // Update transaction
    const { error: updateError } = await supabase
      .from("wallet_transactions")
      .update({
        status: transactionStatus,
        payment_reference: data.transaction_status,
        completed_at: transactionStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      throw handleDatabaseError(updateError, "verifyMidtransCallback - update");
    }

    // If payment successful, no need to manually add coins (materialized view handles it)
    return { success: true, message: "Callback processed" };
  } catch (error) {
    console.error("Verify Midtrans callback error:", error);
    if (error instanceof AppError) throw error;
    // Don't throw for callback verification, log and return
    return { success: false, message: "Callback processing failed" };
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(userId: string) {
  try {
    const balance = await calculateWalletBalance(userId);

    return {
      success: true,
      data: {
        balance: balance,
        currency: "coin",
      },
    };
  } catch (error) {
    console.error("Get wallet balance error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil saldo dompet",
      500
    );
  }
}

/**
 * Get wallet transaction history
 */
export async function getWalletHistory(userId: string, input: unknown) {
  try {
    const data = validateInput(getWalletHistorySchema, input, "getWalletHistory");
    const supabase = createServiceClient();

    let query = supabase
      .from("wallet_transactions")
      .select("*", { count: "exact" })
      .eq("profile_id", userId);

    // Filter by type
    if (data.type !== "all") {
      query = query.eq("type", data.type);
    }

    // Filter by date range
    if (data.startDate) {
      query = query.gte("created_at", data.startDate);
    }
    if (data.endDate) {
      query = query.lte("created_at", data.endDate);
    }

    // Filter completed transactions
    query = query.eq("status", "completed");

    // Pagination
    const { data: transactions, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw handleDatabaseError(error, "getWalletHistory");
    }

    const transactionList = (transactions || []).map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      description: tx.notes,
      paymentMethod: tx.payment_method,
      completedAt: tx.completed_at,
      createdAt: tx.created_at,
    }));

    return {
      success: true,
      data: {
        transactions: transactionList,
        pagination: {
          total: count || 0,
          limit: data.limit,
          offset: data.offset,
          hasMore: (data.offset + data.limit) < (count || 0),
        },
      },
    };
  } catch (error) {
    console.error("Get wallet history error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil history dompet",
      500
    );
  }
}

/**
 * Debit wallet (spend coins)
 */
export async function debitWallet(userId: string, input: unknown) {
  try {
    const data = validateInput(debitWalletSchema, input, "debitWallet");
    const supabase = createServiceClient();

    // Check current balance
    const balance = await calculateWalletBalance(userId);

    if (balance < data.amount) {
      throw new AppError(
        ERROR_CODES.PAYMENT_INSUFFICIENT_BALANCE,
        "Saldo dompet tidak cukup",
        400
      );
    }

    // Create debit transaction
    const { data: transaction, error } = await supabase
      .from("wallet_transactions")
      .insert({
        profile_id: userId,
        type: "spend",
        amount: -data.amount, // Negative for spend
        status: "completed",
        notes: data.reason,
        related_entity_id: data.relatedEntityId || null,
        related_entity_type: data.relatedEntityType || "other",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw handleDatabaseError(error, "debitWallet");
    }

    // Get new balance
    const newBalance = await calculateWalletBalance(userId);

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        amount: data.amount,
        newBalance: newBalance,
      },
      message: "Koin berhasil digunakan",
    };
  } catch (error) {
    console.error("Debit wallet error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat menggunakan koin",
      500
    );
  }
}

/**
 * Get pending transactions
 */
export async function getPendingTransactions(userId: string) {
  try {
    const supabase = createServiceClient();

    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("profile_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw handleDatabaseError(error, "getPendingTransactions");
    }

    const transactionList = (transactions || []).map((tx) => ({
      id: tx.id,
      orderId: tx.order_id,
      amount: tx.amount,
      paymentMethod: tx.payment_method,
      expiresAt: new Date(new Date(tx.created_at).getTime() + 15 * 60000).toISOString(), // 15 min expiry
      createdAt: tx.created_at,
    }));

    return {
      success: true,
      data: transactionList,
    };
  } catch (error) {
    console.error("Get pending transactions error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil transaksi pending",
      500
    );
  }
}

/**
 * Refund transaction
 */
export async function refundTransaction(userId: string, transactionId: string) {
  try {
    const supabase = createServiceClient();

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("profile_id", userId)
      .single();

    if (txError || !transaction) {
      throw new AppError(
        ERROR_CODES.PAYMENT_NOT_FOUND,
        "Transaksi tidak ditemukan",
        404
      );
    }

    if (transaction.status !== "pending" && transaction.status !== "failed") {
      throw new AppError(
        ERROR_CODES.PAYMENT_CANNOT_REFUND,
        `Transaksi dengan status '${transaction.status}' tidak bisa di-refund`,
        400
      );
    }

    // Mark as refunded
    const { error: updateError } = await supabase
      .from("wallet_transactions")
      .update({
        status: "refunded",
        completed_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (updateError) {
      throw handleDatabaseError(updateError, "refundTransaction");
    }

    return {
      success: true,
      message: "Transaksi berhasil di-refund",
    };
  } catch (error) {
    console.error("Refund transaction error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat me-refund transaksi",
      500
    );
  }
}

/**
 * Get wallet summary
 */
export async function getWalletSummary(userId: string) {
  try {
    const supabase = createServiceClient();

    // Get current balance
    const balance = await calculateWalletBalance(userId);

    // Get statistics
    const { data: stats, error } = await supabase
      .rpc("get_wallet_statistics", { user_id: userId });

    if (error) {
      console.error("Error fetching wallet stats:", error);
    }

    return {
      success: true,
      data: {
        currentBalance: balance,
        totalTopup: stats?.total_topup || 0,
        totalSpend: stats?.total_spend || 0,
        totalRefund: stats?.total_refund || 0,
        transactionCount: stats?.transaction_count || 0,
        lastTransaction: stats?.last_transaction || null,
      },
    };
  } catch (error) {
    console.error("Get wallet summary error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil ringkasan dompet",
      500
    );
  }
}
