import { createClient } from "@/server/db/client";

/**
 * WALLET/KOIN SERVER ACTIONS - ROOMAH MVP
 * Midtrans Sandbox integration + Ledger-first model
 */

// ============================================================================
// KOIN PACKAGES
// ============================================================================

export const KOIN_PACKAGES = [
  {
    id: "PACKAGE_5",
    koin: 5,
    amount: 25000, // IDR
    amountIdr: 250, // In ledger (cents)
    label: "5 Koin",
    priceLabel: "Rp 25.000",
  },
  {
    id: "PACKAGE_10",
    koin: 10,
    amount: 50000,
    amountIdr: 500,
    label: "10 Koin",
    priceLabel: "Rp 50.000",
  },
  {
    id: "PACKAGE_100",
    koin: 100,
    amount: 100000,
    amountIdr: 1000,
    label: "100 Koin",
    priceLabel: "Rp 100.000",
    popular: true,
  },
];

// ============================================================================
// GET KOIN BALANCE
// ============================================================================

/**
 * Get user koin balance from wallet_balances_v
 */
export async function getKoinBalance(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wallet_balances_v")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // If no balance record, return 0
    if (error.code === "PGRST116") {
      return {
        success: true,
        data: {
          user_id: userId,
          balance: 0,
          koin: 0,
        },
        error: null,
      };
    }
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data: {
      ...data,
      koin: Math.floor(data.balance / 100), // Convert to koin (1 koin = 100 balance)
    },
    error: null,
  };
}

// ============================================================================
// INITIATE TOP-UP (MIDTRANS SANDBOX)
// ============================================================================

/**
 * Initiate top-up with Midtrans
 * Returns Snap Token for payment
 */
export async function initiateTopup(userId: string, packageId: string) {
  const supabase = await createClient();

  // Find package
  const selectedPackage = KOIN_PACKAGES.find((pkg) => pkg.id === packageId);
  if (!selectedPackage) {
    return {
      success: false,
      error: "Paket tidak ditemukan",
      data: null,
    };
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message, data: null };
  }

  // Generate order ID
  const orderId = `TOPUP-${userId.substring(0, 8)}-${Date.now()}`;

  try {
    // Create payment transaction record (for tracking)
    // Insert to actual table koin_topup_orders, not the view
    // Note: created_at has default value now(), so we don't set it manually
    const { error: txError } = await supabase
      .from("koin_topup_orders")
      .insert({
        order_id: orderId,
        user_id: userId,
        amount_cents: selectedPackage.koin * 100, // Store in balance units (cents)
        status: "PENDING",
        payment_type: null,
      });

    if (txError) {
      console.error("Insert error details:", txError);
      throw new Error("Gagal membuat transaksi: " + txError.message);
    }

    // Call Midtrans Snap API (Sandbox)
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY || "";
    const midtransApiUrl =
      process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1";

    const authString = Buffer.from(midtransServerKey + ":").toString("base64");

    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: selectedPackage.amount,
      },
      customer_details: {
        first_name: profile.full_name || "User",
        email: profile.email || "user@roomah.com",
      },
      item_details: [
        {
          id: packageId,
          price: selectedPackage.amount,
          quantity: 1,
          name: `${selectedPackage.label} - Roomah`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/koin-saya?status=success`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/koin-saya?status=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/koin-saya?status=pending`,
      },
    };

    const response = await fetch(`${midtransApiUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(snapPayload),
    });

    if (!response.ok) {
      throw new Error("Gagal membuat transaksi Midtrans");
    }

    const snapResponse = await response.json();

    return {
      success: true,
      data: {
        snapToken: snapResponse.token,
        orderId,
        redirectUrl: snapResponse.redirect_url,
      },
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memproses top-up",
      data: null,
    };
  }
}

// ============================================================================
// HANDLE MIDTRANS WEBHOOK
// ============================================================================

/**
 * Handle Midtrans webhook callback
 * Verify signature and process payment
 */
export async function handleMidtransWebhook(payload: any) {
  const supabase = await createClient();

  try {
    // 1. Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;

    const signatureKey = payload.signature_key;
    const crypto = require("crypto");
    const hash = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (hash !== signatureKey) {
      return {
        success: false,
        error: "Invalid signature",
        data: null,
      };
    }

    // 2. Get transaction from actual table
    const { data: transaction, error: txError } = await supabase
      .from("koin_topup_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (txError || !transaction) {
      return {
        success: false,
        error: "Transaksi tidak ditemukan",
        data: null,
      };
    }

    // 3. Process based on status
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    let finalStatus = "PENDING";
    let shouldCredit = false;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        finalStatus = "SUCCESS";
        shouldCredit = true;
      }
    } else if (transactionStatus === "settlement") {
      finalStatus = "SUCCESS";
      shouldCredit = true;
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      finalStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      finalStatus = "PENDING";
    }

    // 4. Update transaction status in actual table
    await supabase
      .from("koin_topup_orders")
      .update({
        status: finalStatus,
        payment_type: payload.payment_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // 5. Credit koin if success (idempotency check)
    if (shouldCredit) {
      // Check if already credited using actual table
      const { data: existingCredit } = await supabase
        .from("wallet_transactions")
        .select("id")
        .eq("reason", "TOPUP")
        .eq("description", `Top-up koin - Order ${orderId}`)
        .single();

      if (!existingCredit) {
        // Credit to ledger using actual table
        await supabase.from("wallet_transactions").insert({
          user_id: transaction.user_id,
          type: "CREDIT",
          amount_cents: transaction.amount_cents,
          reason: "TOPUP",
          description: `Top-up koin - Order ${orderId}`,
          metadata: {
            order_id: orderId,
            payment_type: payload.payment_type,
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      data: {
        orderId,
        status: finalStatus,
      },
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memproses webhook",
      data: null,
    };
  }
}

// ============================================================================
// GET TRANSACTION HISTORY
// ============================================================================

/**
 * Get transaction history from ledger
 */
export async function getTransactionHistory(
  userId: string,
  params?: {
    type?: "CREDIT" | "DEBIT";
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();

  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  let query = supabase
    .from("wallet_ledger_entries")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (params?.type) {
    query = query.eq("entry_type", params.type);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return {
    success: true,
    data: data.map((entry) => ({
      ...entry,
      koin: Math.floor(entry.amount / 100),
    })),
    pagination: {
      limit,
      offset,
      total: count || 0,
    },
    error: null,
  };
}
