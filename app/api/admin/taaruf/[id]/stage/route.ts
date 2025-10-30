import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    
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

    const { id: taarufId } = await params;
    const body = await request.json();
    const { newStage } = body;

    if (!newStage) {
      return NextResponse.json(
        { error: "Missing newStage parameter" },
        { status: 400 }
      );
    }

    // Get current taaruf session details
    const { data: taaruf, error: taarufError } = await supabase
      .from("taaruf_sessions")
      .select("user_a, user_b, status, taaruf_code")
      .eq("id", taarufId)
      .single();

    if (taarufError || !taaruf) {
      console.error("Taaruf session fetch error:", taarufError);
      return NextResponse.json(
        { error: "Taaruf session not found" },
        { status: 404 }
      );
    }

    // Handle status changes based on stage
    // If stage is "Khitbah" → mark CV as "in khitbah" to hide from candidate listings
    // If stage is "Selesai" → mark taaruf session as FINISHED
    
    if (newStage === "Khitbah") {
      // Mark CV as "in khitbah" - hide from candidate listings
      await supabase
        .from("cv_data")
        .update({ taaruf_status: "DALAM_KHITBAH" })
        .in("user_id", [taaruf.user_a, taaruf.user_b]);
    } else if (newStage === "Selesai") {
      // Mark taaruf session as FINISHED
      await supabase
        .from("taaruf_sessions")
        .update({ 
          status: "FINISHED",
          ended_at: new Date().toISOString()
        })
        .eq("id", taarufId);
      
      // Reset CV status back to normal (allow them to appear in search again)
      await supabase
        .from("cv_data")
        .update({ taaruf_status: null })
        .in("user_id", [taaruf.user_a, taaruf.user_b]);
    }

    // Store stage update notification for tracking
    // This allows kanban to show current stage
    const notifications = [
      {
        user_id: taaruf.user_a, // Notify user A
        type: "TAARUF_STAGE_UPDATED",
        title: "Tahap Ta'aruf Diperbarui",
        message: `Tahap Ta'aruf ${taaruf.taaruf_code} telah diperbarui ke: ${newStage}`,
        data: {
          taaruf_id: parseInt(taarufId),
          taaruf_code: taaruf.taaruf_code,
          stage: newStage,
          updated_at: new Date().toISOString(),
        },
      },
      {
        user_id: taaruf.user_b, // Notify user B
        type: "TAARUF_STAGE_UPDATED",
        title: "Tahap Ta'aruf Diperbarui",
        message: `Tahap Ta'aruf ${taaruf.taaruf_code} telah diperbarui ke: ${newStage}`,
        data: {
          taaruf_id: parseInt(taarufId),
          taaruf_code: taaruf.taaruf_code,
          stage: newStage,
          updated_at: new Date().toISOString(),
        },
      },
    ];

    await supabase.from("notifications").insert(notifications);

    // Log activity (if audit_logs table exists)
    try {
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action: "UPDATE_TAARUF_STAGE",
        entity_type: "taaruf_requests",
        entity_id: taarufId,
        changes: {
          new_stage: newStage,
        },
      });
    } catch (auditError) {
      // Audit log is optional - don't fail the request
      console.warn("Failed to create audit log:", auditError);
    }

    return NextResponse.json({
      success: true,
      message: `Tahap berhasil diperbarui ke ${newStage}`,
    });
  } catch (error) {
    console.error("Update stage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
