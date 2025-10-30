import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/db/client";

/**
 * GET /api/admin/cv-queue/[userId]
 * Get detailed CV data for admin review
 */
export async function GET(
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

    const supabase = await createClient();
    
    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!adminProfile?.is_admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }
    
    // Get CV data
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (cvError || !cvData) {
      return NextResponse.json(
        { error: "CV not found" },
        { status: 404 }
      );
    }

    // Transform to match expected format
    return NextResponse.json({
      namaLengkap: cvData.full_name,
      gender: cvData.gender,
      tanggalLahir: cvData.birth_date,
      asalDaerah: cvData.province_id, // or you can join with provinces table
      pendidikan: cvData.education,
      pekerjaan: cvData.occupation,
      deskripsiDiri: cvData.self_description || "-",
      status: cvData.status,
      candidateCode: cvData.candidate_code,
      adminNote: cvData.admin_note,
      createdAt: cvData.created_at,
      updatedAt: cvData.updated_at,
    });

  } catch (error) {
    console.error("Error in get CV detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
