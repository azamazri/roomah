import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * GET /api/admin/taaruf/kanban
 * Get taaruf requests organized by status for kanban board
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

    // Get all active taaruf sessions (not requests!)
    // Kanban board should show ACTIVE taaruf sessions that admin can manage
    const { data: taarufSessions, error } = await supabase
      .from("taaruf_sessions")
      .select(`
        id,
        taaruf_code,
        user_a,
        user_b,
        status,
        started_at,
        ended_at
      `)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching taaruf sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch taaruf sessions" },
        { status: 500 }
      );
    }

    // Fetch user names and CV data for all users involved
    if (taarufSessions && taarufSessions.length > 0) {
      // Fetch stage info from notifications (TAARUF_STAGE_UPDATED type)
      const { data: stageNotifications } = await supabase
        .from("notifications")
        .select("data")
        .eq("type", "TAARUF_STAGE_UPDATED")
        .order("created_at", { ascending: false });
      
      // Build stage map (taaruf_session_id -> latest stage)
      const stageMap = new Map();
      if (stageNotifications) {
        for (const notif of stageNotifications) {
          const taarufId = notif.data?.taaruf_id;
          const stage = notif.data?.stage;
          if (taarufId && stage && !stageMap.has(String(taarufId))) {
            stageMap.set(String(taarufId), stage);
          }
        }
      }
      
      const userIds = [...new Set([
        ...taarufSessions.map(t => t.user_a),
        ...taarufSessions.map(t => t.user_b)
      ])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, gender")
        .in("user_id", userIds);

      const { data: cvData } = await supabase
        .from("cv_data")
        .select("user_id, candidate_code, education, occupation, province_id")
        .in("user_id", userIds);

      const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name");

      const provinceMap = new Map(provinces?.map(p => [p.id, p.name]) || []);
      const cvMap = new Map(cvData?.map(cv => [cv.user_id, cv]) || []);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Map database records to TaarufCard format expected by component
      const taarufCards = taarufSessions.map(session => {
        const userAProfile = profileMap.get(session.user_a);
        const userBProfile = profileMap.get(session.user_b);
        const userACV = cvMap.get(session.user_a);
        const userBCV = cvMap.get(session.user_b);
        
        // Get stage from stageMap (from notifications) or fallback to default
        let stage = stageMap.get(String(session.id));
        
        // Fallback if no stage notification found
        if (!stage) {
          if (session.status === "ACTIVE") {
            stage = "Zoom 1"; // Default for newly accepted
          } else if (session.status === "FINISHED") {
            stage = "Selesai";
          } else {
            stage = "Zoom 1"; // Default
          }
        }
        
        return {
          id: session.id, // This is taaruf_sessions.id now! ✅
          taaruf_code: session.taaruf_code,
          pasanganKode: [
            userACV?.candidate_code || userAProfile?.full_name || "Unknown",
            userBCV?.candidate_code || userBProfile?.full_name || "Unknown"
          ],
          stage,
          lastUpdate: session.started_at,
          status: session.status,
          user_a: session.user_a,
          user_b: session.user_b,
          started_at: session.started_at,
          ended_at: session.ended_at,
          // Add detailed user data for modal
          requester: {
            full_name: userAProfile?.full_name || "Unknown",
            gender: userAProfile?.gender,
            cv_data: userACV ? {
              candidate_code: userACV.candidate_code,
              education: userACV.education,
              occupation: userACV.occupation,
              province: provinceMap.get(userACV.province_id),
            } : undefined,
          },
          target: {
            full_name: userBProfile?.full_name || "Unknown",
            gender: userBProfile?.gender,
            cv_data: userBCV ? {
              candidate_code: userBCV.candidate_code,
              education: userBCV.education,
              occupation: userBCV.occupation,
              province: provinceMap.get(userBCV.province_id),
            } : undefined,
          },
        };
      });

      // Organize by stage for kanban board
      const kanban = {
        "Pengajuan": taarufCards.filter(c => c.stage === "Pengajuan"),
        "Zoom 1": taarufCards.filter(c => c.stage === "Zoom 1"),
        "Zoom 2": taarufCards.filter(c => c.stage === "Zoom 2"),
        "Khitbah": taarufCards.filter(c => c.stage === "Khitbah"),
        "Selesai": taarufCards.filter(c => c.stage === "Selesai"),
      };

      return NextResponse.json(kanban);
    }

    // Empty state - return empty arrays for each stage
    return NextResponse.json({
      "Pengajuan": [],
      "Zoom 1": [],
      "Zoom 2": [],
      "Khitbah": [],
      "Selesai": [],
    });

  } catch (error) {
    console.error("Error in taaruf kanban API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
