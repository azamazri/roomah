"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { AppError, ERROR_CODES, handleDatabaseError, validateInput } from "@/lib/api/error";
import { z } from "zod";
import { verifyAdminAccess } from "./auth";

/**
 * Validation schemas
 */
const getAllTransactionsSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  status: z.enum(["pending", "completed", "failed", "refunded", "all"]).default("all"),
  type: z.enum(["topup", "spend", "refund", "all"]).default("all"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  paymentMethod: z.string().optional(),
});

const refundTransactionSchema = z.object({
  transactionId: z.string(),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500),
});

const exportTransactionDataSchema = z.object({
  format: z.enum(["csv", "json"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Get all transactions (admin view)
 */
export async function getAllTransactions(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(getAllTransactionsSchema, input, "getAllTransactions");
    const supabase = createServiceClient();

    let query = supabase
      .from("wallet_transactions")
      .select(
        `*,
        profiles:profile_id (first_name, last_name, email, phone)`,
        { count: "exact" }
      );

    // Filter by status
    if (data.status !== "all") {
      query = query.eq("status", data.status);
    }

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

    // Filter by user
    if (data.userId) {
      query = query.eq("profile_id", data.userId);
    }

    // Filter by amount range
    if (data.minAmount !== undefined) {
      query = query.gte("amount", data.minAmount);
    }
    if (data.maxAmount !== undefined) {
      query = query.lte("amount", data.maxAmount);
    }

    // Filter by payment method
    if (data.paymentMethod) {
      query = query.eq("payment_method", data.paymentMethod);
    }

    const { data: transactions, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw handleDatabaseError(error, "getAllTransactions");
    }

    const transactionList = (transactions || []).map((tx: any) => ({
      id: tx.id,
      userId: tx.profile_id,
      userName: `${tx.profiles?.first_name} ${tx.profiles?.last_name}`,
      email: tx.profiles?.email,
      phone: tx.profiles?.phone,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      paymentMethod: tx.payment_method,
      orderId: tx.order_id,
      notes: tx.notes,
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
    console.error("Get all transactions error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil daftar transaksi",
      500
    );
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStatistics(adminId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    // Get total revenue (completed topups)
    const { data: revenueData } = await supabase
      .rpc("get_payment_statistics");

    // Get transaction count by status
    const { count: completedCount } = await supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: pendingCount } = await supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: failedCount } = await supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed");

    const totalCount = (completedCount || 0) + (pendingCount || 0) + (failedCount || 0);
    const conversionRate = totalCount > 0 ? (((completedCount || 0) / totalCount) * 100).toFixed(1) : 0;

    // Get payment methods breakdown
    const { data: methodBreakdown } = await supabase
      .from("wallet_transactions")
      .select("payment_method")
      .eq("status", "completed")
      .eq("type", "topup");

    const methodStats: Record<string, number> = {};
    (methodBreakdown || []).forEach((tx: any) => {
      const method = tx.payment_method || "unknown";
      methodStats[method] = (methodStats[method] || 0) + 1;
    });

    return {
      success: true,
      data: {
        totalRevenue: revenueData?.total_revenue || 0,
        totalTransactions: totalCount,
        completedTransactions: completedCount || 0,
        pendingTransactions: pendingCount || 0,
        failedTransactions: failedCount || 0,
        conversionRate: parseFloat(conversionRate as string),
        failureRate: ((failedCount || 0) / totalCount * 100).toFixed(1),
        averageTransactionValue: revenueData?.average_value || 0,
        paymentMethodBreakdown: methodStats,
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Get payment statistics error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil statistik pembayaran",
      500
    );
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetail(adminId: string, transactionId: string) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: transaction, error } = await supabase
      .from("wallet_transactions")
      .select(
        `*,
        profiles:profile_id (id, first_name, last_name, email, phone, gender)`
      )
      .eq("id", transactionId)
      .single();

    if (error || !transaction) {
      throw new AppError(
        ERROR_CODES.PAYMENT_NOT_FOUND,
        "Transaksi tidak ditemukan",
        404
      );
    }

    return {
      success: true,
      data: {
        id: transaction.id,
        user: {
          id: transaction.profiles?.id,
          name: `${transaction.profiles?.first_name} ${transaction.profiles?.last_name}`,
          email: transaction.profiles?.email,
          phone: transaction.profiles?.phone,
          gender: transaction.profiles?.gender,
        },
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.payment_method,
        orderId: transaction.order_id,
        paymentReference: transaction.payment_reference,
        notes: transaction.notes,
        relatedEntityId: transaction.related_entity_id,
        relatedEntityType: transaction.related_entity_type,
        createdAt: transaction.created_at,
        completedAt: transaction.completed_at,
      },
    };
  } catch (error) {
    console.error("Get transaction detail error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil detail transaksi",
      500
    );
  }
}

/**
 * Refund transaction (admin action)
 */
export async function refundTransaction(adminId: string, input: unknown) {
  try {
    await verifyAdminAccess(adminId);
    const data = validateInput(refundTransactionSchema, input, "refundTransaction");
    const supabase = createServiceClient();

    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("id", data.transactionId)
      .single();

    if (txError || !transaction) {
      throw new AppError(
        ERROR_CODES.PAYMENT_NOT_FOUND,
        "Transaksi tidak ditemukan",
        404
      );
    }

    if (transaction.status === "refunded") {
      throw new AppError(
        ERROR_CODES.PAYMENT_CANNOT_REFUND,
        "Transaksi sudah di-refund sebelumnya",
        400
      );
    }

    // Update original transaction status
    const { error: updateError } = await supabase
      .from("wallet_transactions")
      .update({
        status: "refunded",
      })
      .eq("id", data.transactionId);

    if (updateError) {
      throw handleDatabaseError(updateError, "refundTransaction - update");
    }

    // Create credit transaction
    if (transaction.type === "topup" && transaction.status === "completed") {
      const { error: creditError } = await supabase
        .from("wallet_transactions")
        .insert({
          profile_id: transaction.profile_id,
          type: "refund",
          amount: transaction.amount,
          status: "completed",
          notes: `Refund untuk transaksi ${data.transactionId}: ${data.reason}`,
          related_entity_id: data.transactionId,
          related_entity_type: "refund",
          completed_at: new Date().toISOString(),
        });

      if (creditError) {
        console.error("Error creating credit transaction:", creditError);
      }
    }

    // Log audit trail
    try {
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "transaction_refunded",
        entity_type: "wallet_transactions",
        entity_id: data.transactionId,
        changes: {
          reason: data.reason,
          amount: transaction.amount,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
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
 * Get transaction report (summary statistics)
 */
export async function getTransactionReport(
  adminId: string,
  startDate?: string,
  endDate?: string
) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    let query = supabase
      .from("wallet_transactions")
      .select("*");

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: transactions } = await query;

    // Calculate statistics
    const stats = {
      totalTransactions: transactions?.length || 0,
      totalRevenue: 0,
      totalRefunds: 0,
      totalSpend: 0,
      byStatus: {
        completed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
      },
      byType: {
        topup: 0,
        spend: 0,
        refund: 0,
      },
      byMethod: {} as Record<string, number>,
    };

    (transactions || []).forEach((tx: any) => {
      stats.byStatus[tx.status as keyof typeof stats.byStatus]++;
      stats.byType[tx.type as keyof typeof stats.byType]++;

      if (tx.payment_method) {
        stats.byMethod[tx.payment_method] = (stats.byMethod[tx.payment_method] || 0) + 1;
      }

      if (tx.status === "completed") {
        if (tx.type === "topup") stats.totalRevenue += tx.amount;
        if (tx.type === "spend") stats.totalSpend += Math.abs(tx.amount);
        if (tx.type === "refund") stats.totalRefunds += tx.amount;
      }
    });

    return {
      success: true,
      data: {
        period: { startDate, endDate },
        statistics: stats,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Get transaction report error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat membuat laporan transaksi",
      500
    );
  }
}

/**
 * Get payments by date range
 */
export async function getPaymentsByDateRange(
  adminId: string,
  startDate: string,
  endDate: string,
  limit: number = 50
) {
  try {
    await verifyAdminAccess(adminId);
    const supabase = createServiceClient();

    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select(
        `*,
        profiles:profile_id (first_name, last_name, email)`
      )
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .eq("type", "topup")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw handleDatabaseError(error, "getPaymentsByDateRange");
    }

    const transactionList = (transactions || []).map((tx: any) => ({
      date: tx.created_at,
      userId: tx.profile_id,
      userName: `${tx.profiles?.first_name} ${tx.profiles?.last_name}`,
      email: tx.profiles?.email,
      amount: tx.amount,
      method: tx.payment_method,
    }));

    return {
      success: true,
      data: transactionList,
    };
  } catch (error) {
    console.error("Get payments by date range error:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Terjadi kesalahan saat mengambil pembayaran",
      500
    );
  }
}
