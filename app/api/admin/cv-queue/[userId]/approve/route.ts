import { NextRequest, NextResponse } from "next/server";
import { approveCV } from "@/server/actions/admin-cv";

/**
 * POST /api/admin/cv-queue/[userId]/approve
 * Admin approves a CV and generates candidate code
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

    // Call server action
    const result = await approveCV(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      candidateCode: result.candidateCode,
    });

  } catch (error) {
    console.error("Error in approve CV API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
