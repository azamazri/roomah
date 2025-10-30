import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * GET /api/admin/coin-topups
 * Get list of ALL coin transactions (topups + expenses)
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
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

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
    const statusFilter = searchParams.get("status") || "";

    // Get ALL wallet transactions (topups + expenses)
    const { data: walletTransactions, error: walletError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (walletError) {
      console.error("Error fetching wallet transactions:", walletError);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    // Get user profiles for all transactions
    const userIds = [...new Set(walletTransactions?.map(t => t.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Transform wallet transactions to unified format
    const allTransactions = (walletTransactions || []).map(tx => {
      const user = profileMap.get(tx.user_id);
      const isCredit = tx.type === "CREDIT";
      const amountInKoin = Math.abs(tx.amount_cents / 100);
      
      // Map reason to readable description
      let description = "";
      switch (tx.reason) {
        case "TOPUP":
          description = "Top-up Koin";
          break;
        case "TAARUF_FEE":
          description = "Biaya Pengajuan Ta'aruf";
          break;
        case "SOCIAL_MEDIA_POST":
          description = "Posting Media Sosial";
          break;
        case "REFUND":
          description = "Refund";
          break;
        default:
          description = tx.reason || "Transaksi Koin";
      }
      
      return {
        id: tx.idempotency_key || `tx-${tx.id}`,
        transactionId: tx.id,
        userId: tx.user_id,
        userName: user?.full_name || "Unknown",
        userEmail: user?.email || "-",
        amount: amountInKoin,
        type: isCredit ? "topup" : "expense",
        transactionType: tx.type,
        reason: tx.reason,
        status: "completed", // All wallet transactions are completed
        description,
        provider: isCredit ? "Midtrans" : "-",
        linkedOrderId: tx.linked_order_id,
        createdAt: tx.created_at,
      };
    });

    // Apply status filter if provided
    let filteredTransactions = allTransactions;
    if (statusFilter) {
      filteredTransactions = allTransactions.filter(tx => tx.status === statusFilter);
    }

    // Apply pagination
    const total = filteredTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      items: paginatedTransactions,
      total,
      totalPages,
      currentPage: page,
      limit,
    });

  } catch (error) {
    console.error("Error in coin transactions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
