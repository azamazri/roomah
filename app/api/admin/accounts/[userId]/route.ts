import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * GET /api/admin/accounts/[userId]
 * Get detailed information and activity log for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { userId } = await params;

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get CV status
    const { data: cvData } = await supabase
      .from("cv_data")
      .select("status, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    // Get wallet balance
    const { data: walletTransactions } = await supabase
      .from("wallet_transactions")
      .select("amount, transaction_type")
      .eq("user_id", userId);

    let coinBalance = 0;
    if (walletTransactions && walletTransactions.length > 0) {
      coinBalance = walletTransactions.reduce((sum, tx) => {
        if (tx.transaction_type === "CREDIT" || tx.transaction_type === "TOPUP") {
          return sum + tx.amount;
        } else if (tx.transaction_type === "DEBIT" || tx.transaction_type === "EXPENSE") {
          return sum - tx.amount;
        }
        return sum;
      }, 0);
    }

    // Get activity log - combine multiple sources
    const activities: any[] = [];

    // 1. CV Updates
    const { data: cvHistory } = await supabase
      .from("cv_data")
      .select("status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (cvHistory) {
      cvHistory.forEach((cv) => {
        activities.push({
          type: "cv_update",
          description: `Update CV - Status: ${cv.status}`,
          timestamp: cv.updated_at || cv.created_at,
        });
      });
    }

    // 2. Wallet Transactions
    const { data: walletHistory } = await supabase
      .from("wallet_transactions")
      .select("amount, transaction_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (walletHistory) {
      walletHistory.forEach((tx) => {
        let desc = "";
        if (tx.transaction_type === "TOPUP" || tx.transaction_type === "CREDIT") {
          desc = `Top-up Koin: +${tx.amount}`;
        } else {
          desc = `Penggunaan Koin: -${tx.amount}`;
        }
        activities.push({
          type: "coin_transaction",
          description: desc,
          timestamp: tx.created_at,
        });
      });
    }

    // 3. Ta'aruf Requests
    const { data: taarufHistory } = await supabase
      .from("taaruf_requests")
      .select("status, created_at, decided_at")
      .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (taarufHistory) {
      taarufHistory.forEach((req) => {
        activities.push({
          type: "taaruf_request",
          description: `Ta'aruf Request - Status: ${req.status}`,
          timestamp: req.decided_at || req.created_at,
        });
      });
    }

    // Sort activities by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return detailed user info
    return NextResponse.json({
      userId: userProfile.user_id,
      nama: userProfile.full_name || "-",
      email: userProfile.email || "-",
      gender: userProfile.gender || "M",
      domisili: userProfile.province_id || "-",
      createdAt: userProfile.created_at,
      statusCv: cvData?.status || "draft",
      coinBalance,
      activities: activities.slice(0, 50), // Limit to 50 recent activities
    });

  } catch (error) {
    console.error("Error fetching account detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
