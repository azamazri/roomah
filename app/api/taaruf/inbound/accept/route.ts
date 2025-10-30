import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import { acceptTaarufRequest } from "@/features/taaruf/server/actions";

/**
 * POST /api/taaruf/inbound/accept
 * Accept an incoming taaruf request
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id: requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required", success: false },
        { status: 400 }
      );
    }

    // Use server action to respond
    const result = await acceptTaarufRequest(requestId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in /api/taaruf/inbound/accept:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}
