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
    const { stage, meeting_datetime, zoom_link, notes } = body;

    if (!stage || !meeting_datetime || !zoom_link) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get taaruf session details
    const { data: taaruf, error: taarufError } = await supabase
      .from("taaruf_sessions")
      .select("user_a, user_b, status, taaruf_code")
      .eq("id", taarufId)
      .single();

    if (taarufError || !taaruf) {
      console.error("Taaruf fetch error:", taarufError);
      return NextResponse.json(
        { error: "Taaruf session not found" },
        { status: 404 }
      );
    }

    if (taaruf.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Taaruf session is not active" },
        { status: 400 }
      );
    }

    // Note: taaruf_zoom_meetings table doesn't exist yet
    // For now, we'll just send notifications
    // You may want to create this table in the future for tracking meetings
    
    // Store meeting info in a generic way (could use a metadata/settings table)
    const zoomSchedule = {
      taaruf_id: taarufId,
      stage,
      meeting_datetime,
      zoom_link,
      notes,
      created_by: user.id,
    };

    // Create notification for both users
    const notifications = [
      {
        user_id: taaruf.user_a,
        type: "ZOOM_SCHEDULED",
        title: `Pertemuan ${stage} Dijadwalkan`,
        message: `Pertemuan ${stage} telah dijadwalkan pada ${new Date(meeting_datetime).toLocaleString("id-ID")}`,
        data: {
          taaruf_id: taarufId,
          taaruf_code: taaruf.taaruf_code,
          zoom_link,
          meeting_datetime,
          stage,
          notes,
        },
      },
      {
        user_id: taaruf.user_b,
        type: "ZOOM_SCHEDULED",
        title: `Pertemuan ${stage} Dijadwalkan`,
        message: `Pertemuan ${stage} telah dijadwalkan pada ${new Date(meeting_datetime).toLocaleString("id-ID")}`,
        data: {
          taaruf_id: taarufId,
          taaruf_code: taaruf.taaruf_code,
          zoom_link,
          meeting_datetime,
          stage,
          notes,
        },
      },
    ];

    console.log("Creating zoom schedule notifications for users:", taaruf.user_a, taaruf.user_b);
    
    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notifications);
    
    if (notifError) {
      console.error("Notification creation error:", notifError);
      // Check if table exists
      if (notifError.code === 'PGRST205' || notifError.message?.includes('not find the table')) {
        return NextResponse.json(
          { 
            error: "Notifications table does not exist. Please create it first.",
            details: notifError.message,
          },
          { status: 500 }
        );
      }
      // Don't fail the whole operation if notification fails
      console.warn("Failed to create notifications, but continuing...");
    } else {
      console.log("Zoom schedule notifications created successfully");
    }

    return NextResponse.json({
      success: true,
      data: zoomSchedule,
    });
  } catch (error) {
    console.error("Schedule zoom error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
