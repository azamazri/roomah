import { NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import { getIncomingRequests } from "@/features/taaruf/server/actions";

/**
 * GET /api/taaruf/inbound
 * Get incoming taaruf requests (CV Masuk)
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
        { error: "Unauthorized", items: [] },
        { status: 401 }
      );
    }

    // Fetch inbound requests
    const result = await getIncomingRequests();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, items: [] },
        { status: 500 }
      );
    }

    // Fetch CV codes separately
    const userIds = result.data?.map((req: any) => req.from_user) || [];
    const { data: cvData } = await supabase
      .from("cv_data")
      .select("user_id, candidate_code")
      .in("user_id", userIds);

    const cvMap = new Map(cvData?.map((cv: any) => [cv.user_id, cv.candidate_code]));

    // Transform data for frontend
    const items =
      result.data?.map((req: any) => ({
        id: req.id,
        kodeKandidat: cvMap.get(req.from_user) || "N/A",
        waktuPengajuan: req.created_at,
        status: req.status.toLowerCase(),
        candidateId: req.from_user,
      })) || [];

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error in /api/taaruf/inbound:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", items: [] },
      { status: 500 }
    );
  }
}
