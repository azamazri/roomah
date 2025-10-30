import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import crypto from "crypto";

/**
 * POST /api/webhooks/midtrans
 * Midtrans Payment Notification Webhook
 * https://docs.midtrans.com/docs/http-notification-webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract notification data
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Verify signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("Invalid signature from Midtrans webhook");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Get database client
    const supabase = await createClient();

    // Get transaction from database
    const { data: transaction, error: txError } = await supabase
      .from("koin_topup_orders")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Determine final status based on Midtrans status
    let finalStatus = "PENDING";
    let shouldCredit = false;

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        finalStatus = "SUCCESS";
        shouldCredit = true;
      }
    } else if (transaction_status === "settlement") {
      finalStatus = "SUCCESS";
      shouldCredit = true;
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      finalStatus = "FAILED";
    } else if (transaction_status === "pending") {
      finalStatus = "PENDING";
    }

    // Update transaction status
    await supabase
      .from("koin_topup_orders")
      .update({
        status: finalStatus,
        payment_type: payment_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    // Credit koin if success (with idempotency check)
    if (shouldCredit) {
      // Check if already credited
      const { data: existingCredit } = await supabase
        .from("wallet_transactions")
        .select("id")
        .eq("idempotency_key", `topup-${order_id}`)
        .maybeSingle();

      if (!existingCredit) {
        // Credit to wallet
        const { error: creditError } = await supabase
          .from("wallet_transactions")
          .insert({
            user_id: transaction.user_id,
            type: "CREDIT",
            amount_cents: transaction.amount_cents,
            reason: "TOPUP",
            linked_order_id: order_id,
            idempotency_key: `topup-${order_id}`,
          });

        if (creditError) {
          console.error("Error crediting koin:", creditError);
          // Don't fail the webhook - we can retry manually
        }
      }
    }

    // Return success response to Midtrans
    return NextResponse.json({
      success: true,
      message: "Notification processed",
    });

  } catch (error) {
    console.error("Error processing Midtrans webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
