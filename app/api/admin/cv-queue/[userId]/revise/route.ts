import { NextRequest, NextResponse } from "next/server";
import { rejectCV } from "@/server/actions/admin-cv";

/**
 * POST /api/admin/cv-queue/[userId]/revise
 * Admin requests CV revision with a note
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get note from request body
    const body = await request.json();
    const { note } = body;

    if (!note || typeof note !== "string" || !note.trim()) {
      return NextResponse.json(
        { error: "Admin note is required for revision" },
        { status: 400 }
      );
    }

    // Call server action
    const result = await rejectCV(userId, note.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error("Error in revise CV API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
