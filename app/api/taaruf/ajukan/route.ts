import { NextRequest, NextResponse } from "next/server";
import { ajukanTaaruf } from "@/features/taaruf/server/actions";
import { validateRequest, ajukanTaarufSchema } from "@/lib/validations/api-schemas";

/**
 * POST /api/taaruf/ajukan
 * User submits taaruf request to another candidate
 * Body: { toUserId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body with Zod
    const validation = await validateRequest(request, ajukanTaarufSchema);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { toUserId } = validation.data;

    // Call server action with all guards
    const result = await ajukanTaaruf(toUserId);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          errorCode: result.errorCode,
          redirectTo: result.redirectTo,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      koinDeducted: result.koinDeducted,
    });

  } catch (error) {
    console.error("Error in ajukan taaruf API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
