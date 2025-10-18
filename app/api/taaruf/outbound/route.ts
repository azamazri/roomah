import { NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import { getCvDikirim } from "@/features/taaruf/server/actions";

/**
 * GET /api/taaruf/outbound
 * Get sent taaruf requests (CV Dikirim)
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

    // Fetch outbound requests
    const result = await getCvDikirim(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, items: [] },
        { status: 500 }
      );
    }

    // If no data, return empty array
    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch CV codes separately
    const userIds = result.data.map((req: any) => req.to_user).filter((id: string) => !!id);
    let cvData = null;
    if (userIds.length > 0) {
      const response = await supabase
        .from("cv_data")
        .select("user_id, candidate_code")
        .in("user_id", userIds);
      cvData = response.data;
    }

    const cvMap = new Map(cvData?.map((cv: any) => [cv.user_id, cv.candidate_code]) || []);

    // Transform data for frontend
    const items =
      result.data?.map((req: any) => {
        return {
          id: req.id,
          kodeKandidat: cvMap.get(req.to_user) || "N/A",
          waktuPengajuan: req.created_at,
          status: req.status.toLowerCase(),
          candidateId: req.to_user,
        };
      }) || [];

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error in /api/taaruf/outbound:", error);
    console.error("Error details:", error.code, error.details, error.hint);
    return NextResponse.json(
      { error: error.message || "Internal server error", items: [] },
      { status: 500 }
    );
  }
}
