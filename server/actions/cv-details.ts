"use server";

import { createClient } from "@/server/db/client";
import { CvData } from "@/features/cv/types";

/**
 * Load CV data for current user
 */
export async function loadCvData(): Promise<CvData | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("User not authenticated");
      return null;
    }

    // Load from cv_data table
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (cvError || !cvData) {
      console.log("No CV data found for user");
      return null;
    }

    // Load from cv_details table if exists
    const { data: cvDetails } = await supabase
      .from("cv_details")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Transform to CvData format
    const result: CvData = {
      status: cvData.status || "draft",
      kodeKandidat: cvData.candidate_code || undefined,
      adminNote: cvData.admin_note || undefined,
      biodata: {
        avatar: cvData.avatar_url || undefined,
        namaLengkap: cvData.full_name || "",
        tanggalLahir: cvData.birth_date || "",
        jenisKelamin: cvData.gender || "",
        statusPernikahan: cvData.marital_status || "",
        domisili: cvData.province_id ? `Province ${cvData.province_id}` : "",
        alamatLengkap: cvDetails?.address || "",
        pendidikan: cvData.education || "",
        pekerjaan: cvData.occupation || "",
        penghasilan: cvData.income_bracket || "",
        tinggiBadan: cvDetails?.height ? cvDetails.height.toString() : "",
        beratBadan: cvDetails?.weight ? cvDetails.weight.toString() : "",
        ciriFisik: cvDetails?.physical_traits || "",
        riwayatPenyakit: cvDetails?.medical_history ? JSON.parse(cvDetails.medical_history) : [],
      },
      latarBelakangKeluarga: {
        namaAyah: cvDetails?.father_name || "",
        pekerjaanAyah: cvDetails?.father_occupation || "",
        namaIbu: cvDetails?.mother_name || "",
        pekerjaanIbu: cvDetails?.mother_occupation || "",
        jumlahSaudara: cvDetails?.sibling_count?.toString() || "",
        anakKe: cvDetails?.birth_order?.toString() || "",
      },
      kondisiIbadah: {
        shalat: cvDetails?.prayer_adherence || "",
        shaum: cvDetails?.fasting_adherence || "",
        tilawah: cvDetails?.quran_recitation || "",
        tahajud: cvDetails?.tahajud_frequency || "",
        kebiasaanIbadah: cvDetails?.worship_habits || "",
      },
      kriteriaPasangan: {
        usia: cvDetails?.desired_age_range || "",
        pendidikan: cvDetails?.desired_education || "",
        pekerjaan: cvDetails?.desired_occupation || "",
        sifatKepribadian: cvDetails?.desired_personality || "",
        kriteriaKhusus: cvDetails?.special_criteria ? JSON.parse(cvDetails.special_criteria) : [],
      },
      rencanaPernikahan: {
        target: cvDetails?.marriage_target || "",
        persiapan: cvDetails?.marriage_preparation || "",
        lokasiTinggal: cvDetails?.desired_living_location || "",
        visiPernikahan: cvDetails?.marriage_vision || "",
      },
    };

    return result;
  } catch (error) {
    console.error("Error loading CV data:", error);
    return null;
  }
}

/**
 * Save CV data
 */
export async function saveCvData(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Extract data from FormData
    const namaLengkap = formData.get("namaLengkap") as string;
    const tanggalLahir = formData.get("tanggalLahir") as string;
    const jenisKelamin = formData.get("jenisKelamin") as string;
    const statusPernikahan = formData.get("statusPernikahan") as string;
    const domisili = formData.get("domisili") as string;
    const pendidikan = formData.get("pendidikan") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const penghasilan = formData.get("penghasilan") as string;

    // Update cv_data (main table)
    const { error: cvDataError } = await supabase
      .from("cv_data")
      .update({
        full_name: namaLengkap,
        birth_date: tanggalLahir,
        gender: jenisKelamin,
        marital_status: statusPernikahan,
        education: pendidikan,
        occupation: pekerjaan,
        income_bracket: penghasilan,
        status: "REVIEW", // Set to review for admin approval
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (cvDataError) {
      console.error("Error updating cv_data:", cvDataError);
      return {
        success: false,
        error: "Failed to update CV main data",
      };
    }

    // Upsert cv_details (extended data)
    const riwayatPenyakitStr = formData.get("riwayatPenyakit") as string;
    const kriteriaKhususStr = formData.get("kriteriaKhusus") as string;

    const { error: cvDetailsError } = await supabase
      .from("cv_details")
      .upsert({
        user_id: user.id,
        address: formData.get("alamatLengkap") as string,
        height: parseInt(formData.get("tinggiBadan") as string) || null,
        weight: parseInt(formData.get("beratBadan") as string) || null,
        physical_traits: formData.get("ciriFisik") as string,
        medical_history: riwayatPenyakitStr || "[]",
        father_name: formData.get("namaAyah") as string,
        father_occupation: formData.get("pekerjaanAyah") as string,
        mother_name: formData.get("namaIbu") as string,
        mother_occupation: formData.get("pekerjaanIbu") as string,
        sibling_count: parseInt(formData.get("jumlahSaudara") as string) || null,
        birth_order: parseInt(formData.get("anakKe") as string) || null,
        prayer_adherence: formData.get("shalat") as string,
        fasting_adherence: formData.get("shaum") as string,
        quran_recitation: formData.get("tilawah") as string,
        tahajud_frequency: formData.get("tahajud") as string,
        worship_habits: formData.get("kebiasaanIbadah") as string,
        desired_age_range: formData.get("usia") as string,
        desired_education: formData.get("pendidikanKriteria") as string,
        desired_occupation: formData.get("pekerjaanKriteria") as string,
        desired_personality: formData.get("sifatKepribadian") as string,
        special_criteria: kriteriaKhususStr || "[]",
        marriage_target: formData.get("target") as string,
        marriage_preparation: formData.get("persiapan") as string,
        desired_living_location: formData.get("lokasiTinggal") as string,
        marriage_vision: formData.get("visiPernikahan") as string,
        updated_at: new Date().toISOString(),
      });

    if (cvDetailsError) {
      console.error("Error upserting cv_details:", cvDetailsError);
      return {
        success: false,
        error: "Failed to save CV details",
      };
    }

    return {
      success: true,
      message: "CV berhasil disimpan! Tunggu verifikasi admin.",
    };
  } catch (error) {
    console.error("Error saving CV data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save CV",
    };
  }
}

/**
 * Upload avatar
 */
export async function uploadAvatar(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const file = formData.get("avatar") as File;
    
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return {
        success: false,
        error: "File size must be less than 1MB",
      };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "File must be JPG, PNG, or WebP",
      };
    }

    // Upload to Supabase Storage with user folder
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cv-avatars")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload avatar",
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("cv-avatars")
      .getPublicUrl(fileName);

    // Try to update cv_data with avatar URL (non-blocking)
    const { error: updateError } = await supabase
      .from("cv_data")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating avatar URL:", updateError);
      // Don't fail - avatar is uploaded, just DB update failed
      // This can happen due to PostgREST cache issues
    }

    // Also update profiles table as backup
    await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", user.id);

    return {
      success: true,
      avatarUrl: publicUrl,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}
