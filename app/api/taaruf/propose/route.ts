import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/db/client";
import { ajukanTaaruf } from "@/features/taaruf/server/actions";

/**
 * POST /api/taaruf/propose
 * Propose taaruf to a candidate
 * Business logic:
 * - CV must be approved
 * - Must have 5 koin
 * - Cannot have active taaruf
 * - Must be opposite gender
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
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required", success: false },
        { status: 400 }
      );
    }

    // Use server action with business guards
    const result = await ajukanTaaruf(user.id, candidateId);

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
    console.error("Error in /api/taaruf/propose:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}
