import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/db/client";

/**
 * GET /api/candidates/[id]
 * Get detailed candidate information for viewing CV
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: candidateId } = await params;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Fetch candidate data from approved_candidates_v and cv_data
    const { data: candidateData, error: candidateError } = await supabase
      .from("approved_candidates_v")
      .select(
        `
        user_id,
        candidate_code,
        full_name,
        age,
        gender_label,
        province,
        education,
        occupation,
        income_bracket,
        height_cm,
        weight_kg,
        taaruf_status
      `
      )
      .eq("user_id", candidateId)
      .single();

    if (candidateError || !candidateData) {
      return NextResponse.json(
        { error: "Candidate not found or not approved" },
        { status: 404 }
      );
    }

    // Fetch additional CV data
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select(
        `
        phone_number,
        email,
        marital_status,
        bio,
        hobbies,
        goals,
        religion_understanding,
        prayer_frequency,
        quran_reading,
        islamic_activities,
        partner_age_min,
        partner_age_max,
        partner_education_min,
        partner_traits,
        marriage_readiness,
        marriage_timeline
      `
      )
      .eq("user_id", candidateId)
      .single();

    if (cvError) {
      console.error("Error fetching detailed CV:", cvError);
    }

    // Combine data
    const candidateSummary = {
      userId: candidateData.user_id,
      candidateCode: candidateData.candidate_code,
      fullName: candidateData.full_name,
      age: candidateData.age,
      gender: candidateData.gender_label,
      province: candidateData.province,
      education: candidateData.education,
      occupation: candidateData.occupation,
      incomeBracket: candidateData.income_bracket,
      heightCm: candidateData.height_cm,
      weightKg: candidateData.weight_kg,
      taarufStatus: candidateData.taaruf_status,
      phoneNumber: cvData?.phone_number || null,
      email: cvData?.email || null,
      maritalStatus: cvData?.marital_status || null,
      bio: cvData?.bio || null,
      hobbies: cvData?.hobbies || null,
      goals: cvData?.goals || null,
      religionUnderstanding: cvData?.religion_understanding || null,
      prayerFrequency: cvData?.prayer_frequency || null,
      quranReading: cvData?.quran_reading || null,
      islamicActivities: cvData?.islamic_activities || null,
      partnerAgeMin: cvData?.partner_age_min || null,
      partnerAgeMax: cvData?.partner_age_max || null,
      partnerEducationMin: cvData?.partner_education_min || null,
      partnerTraits: cvData?.partner_traits || null,
      marriageReadiness: cvData?.marriage_readiness || null,
      marriageTimeline: cvData?.marriage_timeline || null,
    };

    return NextResponse.json(candidateSummary);
  } catch (error: any) {
    console.error("Error in /api/candidates/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
