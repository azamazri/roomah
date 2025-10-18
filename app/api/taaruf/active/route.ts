import { NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import { getTaarufAktif } from "@/features/taaruf/server/actions";

/**
 * GET /api/taaruf/active
 * Get active taaruf sessions
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

    // Fetch active sessions
    const result = await getTaarufAktif(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, items: [] },
        { status: 500 }
      );
    }

    // Fetch CV codes separately
    const userIds = result.data?.map((session: any) => 
      session.user_a === user.id ? session.user_b : session.user_a
    ) || [];
    
    const { data: cvData } = await supabase
      .from("cv_data")
      .select("user_id, candidate_code")
      .in("user_id", userIds);

    const cvMap = new Map(cvData?.map((cv: any) => [cv.user_id, cv.candidate_code]));

    // Transform data for frontend
    const items =
      result.data?.map((session: any) => {
        // Determine other user (candidate)
        const isUserA = session.user_a === user.id;
        const otherUserId = isUserA ? session.user_b : session.user_a;

        return {
          id: session.id,
          kodeTaaruf: session.taaruf_code,
          kodeKandidat: cvMap.get(otherUserId) || "N/A",
          waktuMulai: session.started_at,
          status: "active",
          candidateId: otherUserId,
        };
      }) || [];

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error in /api/taaruf/active:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", items: [] },
      { status: 500 }
    );
  }
}
