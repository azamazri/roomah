import { NextRequest, NextResponse } from "next/server";
import { getIncomingRequests } from "@/features/taaruf/server/actions";

/**
 * GET /api/taaruf/requests/incoming
 * Get incoming taaruf requests (CV Masuk)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await getIncomingRequests();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("authenticated") ? 401 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error("Error in get incoming requests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
