import { NextRequest, NextResponse } from "next/server";
import { getActiveTaaruf } from "@/features/taaruf/server/actions";

/**
 * GET /api/taaruf/active
 * Get active taaruf sessions
 */
export async function GET(request: NextRequest) {
  try {
    const result = await getActiveTaaruf();

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
    console.error("Error in get active taaruf API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
