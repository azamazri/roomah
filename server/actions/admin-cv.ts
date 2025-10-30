"use server";

import { createClient } from "@/server/db/client";
import { generateCandidateCodeSafe } from "@/server/services/sequence";
import { GenderEnum } from "@/types/database.types";

/**
 * Admin action to approve CV
 * Auto-generates candidate code when approved
 */
export async function approveCV(userId: string) {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    
    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!adminProfile?.is_admin) {
      return {
        success: false,
        error: "Unauthorized - Admin only",
      };
    }
    
    // Get CV data to extract gender
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("gender, candidate_code")
      .eq("user_id", userId)
      .single();
    
    if (cvError || !cvData) {
      return {
        success: false,
        error: "CV not found",
      };
    }
    
    // Validate gender exists
    if (!cvData.gender) {
      return {
        success: false,
        error: "Gender tidak ditemukan pada CV. Pastikan CV sudah lengkap.",
      };
    }
    
    console.log("CV gender:", cvData.gender);
    
    // Check if candidate code already exists
    let candidateCode = cvData.candidate_code;
    
    if (!candidateCode) {
      // Generate candidate code based on gender
      try {
        console.log("Generating candidate code for gender:", cvData.gender);
        candidateCode = await generateCandidateCodeSafe(cvData.gender as GenderEnum);
        
        console.log("Generated candidate code:", candidateCode);
        
        if (!candidateCode) {
          return {
            success: false,
            error: `Failed to generate candidate code for gender: ${cvData.gender}. Check server logs for details.`,
          };
        }
      } catch (genError) {
        console.error("Error generating candidate code:", genError);
        return {
          success: false,
          error: `Gagal membuat kode kandidat: ${genError instanceof Error ? genError.message : 'Unknown error'}`,
        };
      }
    }
    
    // Update CV status to APPROVED and set candidate code
    const { error: updateError } = await supabase
      .from("cv_data")
      .update({
        status: "APPROVED",
        candidate_code: candidateCode,
        admin_note: null, // Clear any previous notes
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Error updating CV:", updateError);
      return {
        success: false,
        error: "Failed to approve CV",
      };
    }
    
    return {
      success: true,
      candidateCode,
      message: `CV approved with code: ${candidateCode}`,
    };
    
  } catch (error) {
    console.error("Error approving CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve CV",
    };
  }
}

/**
 * Admin action to reject/revise CV
 */
export async function rejectCV(userId: string, adminNote: string) {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    
    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!adminProfile?.is_admin) {
      return {
        success: false,
        error: "Unauthorized - Admin only",
      };
    }
    
    // Update CV status to REVISI with admin note
    const { error: updateError } = await supabase
      .from("cv_data")
      .update({
        status: "REVISI",
        admin_note: adminNote,
        candidate_code: null, // Remove candidate code on revision
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Error rejecting CV:", updateError);
      return {
        success: false,
        error: "Failed to reject CV",
      };
    }
    
    return {
      success: true,
      message: "CV marked for revision",
    };
    
  } catch (error) {
    console.error("Error rejecting CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject CV",
    };
  }
}

/**
 * Get list of CVs pending review
 */
export async function getPendingCVs() {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        data: null,
      };
    }
    
    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!adminProfile?.is_admin) {
      return {
        success: false,
        error: "Unauthorized - Admin only",
        data: null,
      };
    }
    
    // Get CVs with status REVIEW (waiting for admin approval)
    // Status REVIEW = CV yang sudah disimpan user dan menunggu verifikasi admin
    const { data: cvs, error: cvsError } = await supabase
      .from("cv_data")
      .select(`
        user_id,
        full_name,
        gender,
        birth_date,
        province_id,
        education,
        occupation,
        status,
        candidate_code,
        admin_note,
        created_at,
        updated_at,
        marital_status,
        height_cm,
        weight_kg,
        income_bracket
      `)
      .eq("status", "REVIEW")
      .order("created_at", { ascending: true });
    
    if (cvsError) {
      return {
        success: false,
        error: "Failed to fetch CVs",
        data: null,
      };
    }
    
    return {
      success: true,
      data: cvs,
    };
    
  } catch (error) {
    console.error("Error fetching pending CVs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch CVs",
      data: null,
    };
  }
}
