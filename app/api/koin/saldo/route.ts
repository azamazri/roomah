import { NextResponse } from "next/server";
import { createClient } from "@/server/db/client";

/**
 * GET /api/koin/saldo
 * Get current koin balance for authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", balance: 0 },
        { status: 401 }
      );
    }

    // Fetch wallet balance from view
    const { data: balanceData, error: balanceError } = await supabase
      .from("wallet_balances_v")
      .select("balance_cents")
      .eq("user_id", user.id)
      .maybeSingle(); // Use maybeSingle() to allow 0 rows

    // If error and not just empty result, return error
    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error("Error fetching balance:", balanceError);
      return NextResponse.json(
        { error: "Failed to fetch balance", balance: 0 },
        { status: 500 }
      );
    }

    // Convert cents to koin (100 cents = 1 koin)
    const balanceInKoin = balanceData?.balance_cents ? balanceData.balance_cents / 100 : 0;

    return NextResponse.json({
      balance: balanceInKoin,
      balanceCents: balanceData?.balance_cents || 0,
    });
  } catch (error: any) {
    console.error("Error in /api/koin/saldo:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", balance: 0 },
      { status: 500 }
    );
  }
}
