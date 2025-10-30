import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * GET /api/admin/accounts
 * Get list of user accounts for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    console.log("Admin check - User ID:", user.id);
    console.log("Admin check - Profile:", profile);
    console.log("Admin check - Error:", profileError);

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build query - get profiles only first
    let query = supabase
      .from("profiles")
      .select("user_id, full_name, email, gender, created_at", { count: "exact" });

    // Apply filters
    if (q) {
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    if (status === "suspended") {
      query = query.eq("is_suspended", true);
    } else if (status === "active") {
      query = query.eq("is_suspended", false);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    const { data: accounts, error, count } = await query;

    if (error) {
      console.error("Error fetching accounts:", error);
      return NextResponse.json(
        { error: "Failed to fetch accounts" },
        { status: 500 }
      );
    }

    // Get additional data for each account
    const items = await Promise.all((accounts || []).map(async (account: any) => {
      // Get CV status
      const { data: cvData } = await supabase
        .from("cv_data")
        .select("status")
        .eq("user_id", account.user_id)
        .maybeSingle();

      // Get wallet balance - use aggregate sum of all transactions
      const { data: walletTransactions } = await supabase
        .from("wallet_transactions")
        .select("amount, transaction_type")
        .eq("user_id", account.user_id);
      
      // Calculate balance from transactions
      let balance = 0;
      if (walletTransactions && walletTransactions.length > 0) {
        balance = walletTransactions.reduce((sum, tx) => {
          if (tx.transaction_type === "CREDIT" || tx.transaction_type === "TOPUP") {
            return sum + tx.amount;
          } else if (tx.transaction_type === "DEBIT" || tx.transaction_type === "EXPENSE") {
            return sum - tx.amount;
          }
          return sum;
        }, 0);
      }

      return {
        userId: account.user_id,
        nama: account.full_name || "-",
        email: account.email || "-",
        gender: account.gender || "M",
        createdAt: account.created_at,
        statusCv: cvData?.status || "draft",
        coinBalance: balance,
      };
    }));

    return NextResponse.json({
      items,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error) {
    console.error("Error in accounts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
