"use server";

import { createClient } from "@/server/db/client";
import { CvData } from "@/features/cv/types";
import { capitalizeEachWord } from "@/lib/utils/text";

/**
 * Convert income bracket enum to display format
 */
function formatIncomeBracket(bracket: string | null): string {
  if (!bracket) return "";
  
  const mapping: Record<string, string> = {
    "0_2": "0-2",
    "2_5": "2-5",
    "5_10": "5-10",
    "10_PLUS": "10+",
    "SAAT_TAARUF": "Saat Taaruf",
  };
  
  return mapping[bracket] || bracket;
}

/**
 * Convert display format to income bracket enum
 */
function parseIncomeBracket(display: string | null): string {
  if (!display) return "";
  
  // Already in enum format
  if (display.includes("_")) {
    return display;
  }
  
  const reverseMapping: Record<string, string> = {
    "0-2": "0_2",
    "2-5": "2_5",
    "5-10": "5_10",
    "10+": "10_PLUS",
    "Saat Taaruf": "SAAT_TAARUF",
  };
  
  return reverseMapping[display] || display;
}

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

    // Get avatar from profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("user_id", user.id)
      .single();
    
    // Get public URL from avatar_path
    let avatarUrl = null;
    if (profileData?.avatar_path) {
      const { data: { publicUrl } } = supabase.storage
        .from("cv-avatars")
        .getPublicUrl(profileData.avatar_path);
      avatarUrl = publicUrl;
    }

    // Load from cv_details table if exists (JSONB structure)
    const { data: cvDetails } = await supabase
      .from("cv_details")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Extract JSONB data
    const familyBg = cvDetails?.family_background || {};
    const worshipProf = cvDetails?.worship_profile || {};
    const spouseCrit = cvDetails?.spouse_criteria || {};
    const marriagePl = cvDetails?.marriage_plan || {};

    // Get province name from province_id
    let provinceName = "";
    if (cvData.province_id) {
      const { data: provinceData } = await supabase
        .from("provinces")
        .select("name")
        .eq("id", cvData.province_id)
        .single();
      provinceName = provinceData?.name || "";
    }

    // Transform to CvData format (must match form field expectations)
    const result: CvData = {
      status: cvData.status || "draft",
      kodeKandidat: cvData.candidate_code || undefined,
      adminNote: cvData.admin_note || undefined,
      biodata: {
        avatar: avatarUrl || undefined,
        namaLengkap: cvData.full_name || "",
        tanggalLahir: cvData.birth_date || "",
        jenisKelamin: cvData.gender || "",
        statusPernikahan: cvData.marital_status || "",
        domisili: provinceName,
        alamatLengkap: familyBg.address || "",
        pendidikan: cvData.education || "",
        pekerjaan: cvData.occupation || "",
        penghasilan: cvData.income_bracket || "",
        tinggiBadan: familyBg.height ? familyBg.height.toString() : "",
        beratBadan: familyBg.weight ? familyBg.weight.toString() : "",
        ciriFisik: familyBg.physical_traits || "",
        riwayatPenyakit: familyBg.medical_history || [],
        keberadaanOrangTua: familyBg.parent_status || "",
        pekerjaanOrangTua: familyBg.parent_occupation || "",
        anakKe: familyBg.birth_order?.toString() || "",
        saudaraKandung: familyBg.sibling_count?.toString() || "",
      },
      latarBelakangKeluarga: {
        namaAyah: "",
        pekerjaanAyah: "",
        namaIbu: "",
        pekerjaanIbu: "",
        jumlahSaudara: "",
        anakKe: "",
      },
      kondisiIbadah: {
        shalat: "",
        shaum: "",
        tilawah: "",
        tahajud: "",
        kebiasaanIbadah: "",
        shalatFardu: worshipProf.prayer_fardu || "",
        bacaanQuran: worshipProf.quran_reading || "",
        shalatSunnah: worshipProf.prayer_sunnah || "",
        hafalanQuran: worshipProf.quran_memorization || "",
        puasa: worshipProf.fasting || "",
        kajian: worshipProf.kajian || "",
      },
      kriteriaPasangan: {
        usia: spouseCrit.desired_age || "",
        pendidikan: spouseCrit.desired_education || "",
        pekerjaan: "",
        sifatKepribadian: "",
        kriteriaKhusus: spouseCrit.special_criteria || [],
        usiaCriteria: spouseCrit.desired_age || "",
        pendidikanCriteria: spouseCrit.desired_education || "",
        penghasilanCriteria: spouseCrit.desired_income || "",
        penghasilan: spouseCrit.desired_income || "",
        ciriFisik: spouseCrit.desired_physical_traits || "",
      },
      rencanaPernikahan: {
        target: "",
        persiapan: "",
        lokasiTinggal: "",
        visiPernikahan: "",
        tahunNikah: marriagePl.marriage_year || "",
        tempatTinggal: marriagePl.living_location || "",
        visi: marriagePl.vision || "",
        misi: marriagePl.mission || "",
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

    // Extract data from FormData and apply Capitalize Each Word normalization
    const namaLengkap = capitalizeEachWord(formData.get("namaLengkap") as string);
    const tanggalLahir = formData.get("tanggalLahir") as string;
    const jenisKelamin = formData.get("jenisKelamin") as string;
    const statusPernikahan = formData.get("statusPernikahan") as string;
    const domisiliName = formData.get("domisili") as string; // Province name from form
    const pendidikan = formData.get("pendidikan") as string;
    const pekerjaan = capitalizeEachWord(formData.get("pekerjaan") as string);
    const penghasilan = formData.get("penghasilan") as string;

    // Get province_id from province name
    let provinceId = null;
    if (domisiliName) {
      const { data: provinceData } = await supabase
        .from("provinces")
        .select("id")
        .eq("name", domisiliName)
        .single();
      provinceId = provinceData?.id || null;
    }

    // Update profiles table with gender (KRUSIAL untuk filtering candidate by gender)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: namaLengkap,
        gender: jenisKelamin as "IKHWAN" | "AKHWAT",
        dob: tanggalLahir,
        province_id: provinceId,
        education: pendidikan as "SMA_SMK" | "D3" | "S1" | "S2" | "S3",
        occupation: pekerjaan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Error updating profiles:", profileError);
      return {
        success: false,
        error: "Failed to update profile data",
      };
    }

    // Check current CV status to preserve APPROVED status
    const { data: existingCv } = await supabase
      .from("cv_data")
      .select("status, candidate_code")
      .eq("user_id", user.id)
      .maybeSingle();

    // Upsert cv_data (main table) - MUST use upsert to handle first-time CV creation
    const cvDataPayload: any = {
      user_id: user.id,
      full_name: namaLengkap,
      birth_date: tanggalLahir,
      gender: jenisKelamin,
      marital_status: statusPernikahan,
      education: pendidikan,
      occupation: pekerjaan,
      income_bracket: penghasilan,
      updated_at: new Date().toISOString(),
    };

    // IMPORTANT: Don't change status if CV is already APPROVED
    // This prevents constraint violation (approved CV must have candidate_code)
    if (!existingCv || existingCv.status !== "APPROVED") {
      cvDataPayload.status = "REVIEW"; // Only set to REVIEW for new/draft CVs
    }
    // If already APPROVED, keep existing status and candidate_code

    if (provinceId) {
      cvDataPayload.province_id = provinceId;
    }

    const { error: cvDataError } = await supabase
      .from("cv_data")
      .upsert(cvDataPayload, { onConflict: "user_id" });

    if (cvDataError) {
      console.error("Error upserting cv_data:", cvDataError);
      return {
        success: false,
        error: "Failed to save CV main data",
      };
    }

    // Upsert cv_details (extended data using JSONB structure)
    const riwayatPenyakitStr = formData.get("riwayatPenyakit") as string;
    const kriteriaKhususStr = formData.get("kriteriaKhusus") as string;

    // Prepare JSONB objects for cv_details
    // Note: Form uses different field names, need to map from actual form fields
    const familyBackground = {
      address: capitalizeEachWord(formData.get("alamatLengkap") as string) || "",
      height: parseInt(formData.get("tinggiBadan") as string) || null,
      weight: parseInt(formData.get("beratBadan") as string) || null,
      physical_traits: capitalizeEachWord(formData.get("ciriFisik") as string) || "",
      medical_history: riwayatPenyakitStr ? JSON.parse(riwayatPenyakitStr) : [],
      parent_status: formData.get("keberadaanOrangTua") as string || "",
      parent_occupation: capitalizeEachWord(formData.get("pekerjaanOrangTua") as string) || "",
      sibling_count: parseInt(formData.get("saudaraKandung") as string) || null,
      birth_order: parseInt(formData.get("anakKe") as string) || null,
    };

    const worshipProfile = {
      prayer_fardu: formData.get("shalatFardu") as string || "",
      quran_reading: formData.get("bacaanQuran") as string || "",
      prayer_sunnah: capitalizeEachWord(formData.get("shalatSunnah") as string) || "",
      quran_memorization: capitalizeEachWord(formData.get("hafalanQuran") as string) || "",
      fasting: capitalizeEachWord(formData.get("puasa") as string) || "",
      kajian: capitalizeEachWord(formData.get("kajian") as string) || "",
    };

    const spouseCriteria = {
      desired_age: formData.get("kriteriaUsia") as string || "",
      desired_education: formData.get("kriteriaPendidikan") as string || "",
      desired_income: formData.get("kriteriaPenghasilan") as string || "",
      desired_physical_traits: capitalizeEachWord(formData.get("kriteriaCiriFisik") as string) || "",
      special_criteria: kriteriaKhususStr ? JSON.parse(kriteriaKhususStr) : [],
    };

    const marriagePlan = {
      marriage_year: formData.get("tahunNikah") as string || "",
      living_location: capitalizeEachWord(formData.get("tempatTinggal") as string) || "",
      vision: capitalizeEachWord(formData.get("visi") as string) || "",
      mission: capitalizeEachWord(formData.get("misi") as string) || "",
    };

    const { error: cvDetailsError } = await supabase
      .from("cv_details")
      .upsert({
        user_id: user.id,
        family_background: familyBackground,
        worship_profile: worshipProfile,
        spouse_criteria: spouseCriteria,
        marriage_plan: marriagePlan,
        updated_at: new Date().toISOString(),
      });

    if (cvDetailsError) {
      console.error("Error upserting cv_details:", cvDetailsError);
      return {
        success: false,
        error: "Failed to save CV details",
      };
    }

    console.log("CV data saved successfully!");
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

    // Update profiles table with avatar path
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_path: fileName,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating avatar path:", updateError);
      // Don't fail - avatar is uploaded, just DB update failed
    }

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

/**
 * Load CV data for a specific user (admin use only)
 */
export async function loadCvDataByUserId(userId: string): Promise<CvData | null> {
  try {
    const supabase = await createClient();

    // Get CV data
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (cvError) {
      console.error("Error loading CV data:", cvError);
      return null;
    }

    if (!cvData) {
      return null;
    }

    // Get profile data for avatar
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("user_id", userId)
      .single();

    // Get public URL for avatar
    let avatarUrl = "";
    if (profileData?.avatar_path) {
      const { data } = supabase.storage
        .from("cv-avatars")
        .getPublicUrl(profileData.avatar_path);
      avatarUrl = data.publicUrl;
    }

    // Get cv_details
    const { data: cvDetails } = await supabase
      .from("cv_details")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Parse JSONB fields from cv_details
    const familyBackground = cvDetails?.family_background || {};
    const worshipProfile = cvDetails?.worship_profile || {};
    const spouseCriteria = cvDetails?.spouse_criteria || {};
    const marriagePlan = cvDetails?.marriage_plan || {};

    // Get province name from province_id
    let provinceName = "";
    if (cvData.province_id) {
      const { data: provinceData } = await supabase
        .from("provinces")
        .select("name")
        .eq("id", cvData.province_id)
        .single();
      provinceName = provinceData?.name || "";
    }

    // Construct CV data matching the actual CvData type structure
    const result: CvData = {
      kodeKandidat: cvData.kode_kandidat || "",
      status: cvData.status as "draft" | "approved" | "revisi",
      biodata: {
        avatar: avatarUrl,
        namaLengkap: cvData.full_name || "",
        tanggalLahir: cvData.birth_date || cvData.dob || "",
        jenisKelamin: cvData.gender || "",
        statusPernikahan: cvData.marital_status || "",
        domisili: provinceName || cvData.domicile || "",
        alamatLengkap: familyBackground.address || "",
        pendidikan: cvData.education || "",
        pekerjaan: cvData.occupation || "",
        penghasilan: formatIncomeBracket(cvData.income_bracket),
        tinggiBadan: familyBackground.height?.toString() || "",
        beratBadan: familyBackground.weight?.toString() || "",
        ciriFisik: familyBackground.physical_traits || "",
        riwayatPenyakit: familyBackground.medical_history || [],
        keberadaanOrangTua: familyBackground.parent_status || "",
        pekerjaanOrangTua: familyBackground.parent_occupation || "",
        anakKe: familyBackground.birth_order?.toString() || "",
        saudaraKandung: familyBackground.sibling_count?.toString() || "",
      },
      latarBelakangKeluarga: {
        namaAyah: familyBackground.namaAyah || "",
        pekerjaanAyah: familyBackground.pekerjaanAyah || "",
        namaIbu: familyBackground.namaIbu || "",
        pekerjaanIbu: familyBackground.pekerjaanIbu || "",
        jumlahSaudara: familyBackground.sibling_count?.toString() || "",
        anakKe: familyBackground.birth_order?.toString() || "",
      },
      kondisiIbadah: {
        shalat: worshipProfile.shalat || "",
        shaum: worshipProfile.shaum || "",
        tilawah: worshipProfile.tilawah || "",
        tahajud: worshipProfile.tahajud || "",
        kebiasaanIbadah: worshipProfile.kebiasaanIbadah || "",
        shalatFardu: worshipProfile.prayer_fardu || "",
        bacaanQuran: worshipProfile.quran_reading || "",
        shalatSunnah: worshipProfile.prayer_sunnah || "",
        hafalanQuran: worshipProfile.quran_memorization || "",
        puasa: worshipProfile.fasting || "",
        kajian: worshipProfile.kajian || "",
      },
      kriteriaPasangan: {
        usia: spouseCriteria.desired_age || "",
        pendidikan: spouseCriteria.desired_education || "",
        pekerjaan: spouseCriteria.pekerjaan || "",
        sifatKepribadian: spouseCriteria.sifatKepribadian || "",
        kriteriaKhusus: spouseCriteria.special_criteria || [],
        usiaCriteria: spouseCriteria.desired_age || "",
        pendidikanCriteria: spouseCriteria.desired_education || "",
        penghasilanCriteria: spouseCriteria.desired_income || "",
        penghasilan: spouseCriteria.desired_income || "",
        ciriFisik: spouseCriteria.desired_physical_traits || "",
      },
      rencanaPernikahan: {
        target: marriagePlan.target || "",
        persiapan: marriagePlan.persiapan || "",
        lokasiTinggal: marriagePlan.living_location || "",
        visiPernikahan: marriagePlan.visiPernikahan || "",
        tahunNikah: marriagePlan.marriage_year || "",
        tempatTinggal: marriagePlan.living_location || "",
        visi: marriagePlan.vision || "",
        misi: marriagePlan.mission || "",
      },
    };

    return result;
  } catch (error) {
    console.error("Error in loadCvDataByUserId:", error);
    return null;
  }
}
