import { NextRequest, NextResponse } from "next/server";
import { acceptTaarufRequest } from "@/features/taaruf/server/actions";

/**
 * POST /api/taaruf/requests/[requestId]/accept
 * Accept incoming taaruf request
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

    const result = await acceptTaarufRequest(requestId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      taarufCode: result.taarufCode,
    });

  } catch (error) {
    console.error("Error in accept taaruf API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
