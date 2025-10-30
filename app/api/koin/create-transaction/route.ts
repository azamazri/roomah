import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { initiateTopup } from "@/features/koin/server/actions";

/**
 * POST /api/koin/create-transaction
 * Create Midtrans payment transaction and return Snap token
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "packageId is required" },
        { status: 400 }
      );
    }

    // Call server action to initiate top-up
    const result = await initiateTopup(user.id, packageId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create transaction" },
        { status: 400 }
      );
    }

    // Return Snap token and order ID
    return NextResponse.json({
      success: true,
      token: result.data?.snapToken,
      orderId: result.data?.orderId,
      redirectUrl: result.data?.redirectUrl,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
