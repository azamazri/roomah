import { NextRequest, NextResponse } from "next/server";
import { rejectTaarufRequest } from "@/features/taaruf/server/actions";

/**
 * POST /api/taaruf/requests/[requestId]/reject
 * Reject incoming taaruf request
 * Body: { reason?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    const result = await rejectTaarufRequest(requestId, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error("Error in reject taaruf API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
