import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { createClient } from "@/server/db/client";

/**
 * POST /api/koin/confirm
 * Manually confirm payment by checking Midtrans transaction status
 * This is used after payment success in Snap popup
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Get transaction from database
    // Query from actual table koin_topup_orders, not the view
    const dbClient = await createClient();
    const { data: transaction, error: txError } = await dbClient
      .from("koin_topup_orders")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (txError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check transaction status from Midtrans
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY || "";
    const midtransApiUrl =
      process.env.MIDTRANS_IS_PROD === "true"
        ? "https://api.midtrans.com/v2"
        : "https://api.sandbox.midtrans.com/v2";

    const authString = Buffer.from(midtransServerKey + ":").toString("base64");

    const statusResponse = await fetch(`${midtransApiUrl}/${orderId}/status`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    if (!statusResponse.ok) {
      throw new Error("Failed to check payment status from Midtrans");
    }

    const statusData = await statusResponse.json();
    const transactionStatus = statusData.transaction_status;
    const fraudStatus = statusData.fraud_status;

    // Determine final status
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

    // Update transaction status in actual table
    await dbClient
      .from("koin_topup_orders")
      .update({
        status: finalStatus,
        payment_type: statusData.payment_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // Credit koin if success (with idempotency check)
    if (shouldCredit) {
      // Check if already credited using actual table with idempotency key
      const { data: existingCredit } = await dbClient
        .from("wallet_transactions")
        .select("id")
        .eq("idempotency_key", `topup-${orderId}`)
        .maybeSingle();

      if (!existingCredit) {
        // Credit to ledger using actual table wallet_transactions
        const { data: creditData, error: creditError } = await dbClient
          .from("wallet_transactions")
          .insert({
            user_id: user.id,
            type: "CREDIT",
            amount_cents: transaction.amount_cents,
            reason: "TOPUP",
            linked_order_id: orderId,
            idempotency_key: `topup-${orderId}`,
          })
          .select();

        if (creditError) {
          throw new Error(`Failed to credit koin: ${creditError.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      credited: shouldCredit,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
