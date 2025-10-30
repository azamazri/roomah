import { NextRequest, NextResponse } from "next/server";
import { getPendingCVs } from "@/server/actions/admin-cv";

/**
 * GET /api/admin/cv-queue
 * Get list of CVs pending admin review
 */
export async function GET(request: NextRequest) {
  try {
    // Call server action
    const result = await getPendingCVs();

    if (!result.success) {
      console.error("getPendingCVs error:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 400 }
      );
    }

    console.log("CV Queue Data:", result.data);

    // Map data to expected format
    const items = (result.data || []).map((cv: any) => ({
      userId: cv.user_id,
      nama: cv.full_name,
      gender: cv.gender,
      submittedAt: cv.created_at || cv.updated_at,
      status: cv.status,
    }));

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      totalPages: 1,
    });

  } catch (error) {
    console.error("Error in get CV queue API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
