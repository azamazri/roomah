"use server";

import { CvData } from "../types";
import { cvSchema } from "../schemas/cv";
import { normalizeCvData } from "../lib/normalize";
import { getUser } from "@/features/auth/lib/session";

// Mock storage untuk CV data
const mockCvStorage = new Map<string, CvData>();

// Mock CV data untuk testing
const mockCvData: CvData = {
  biodata: {
    namaLengkap: "Ahmad Fauzan",
    tanggalLahir: "1996-07-20",
    statusPernikahan: "Single",
    alamatLengkap: "Jl. Merdeka No. 123, Jakarta Pusat",
    domisili: "DKI Jakarta",
    pendidikan: "S1 Teknik Informatika",
    pekerjaan: "Software Engineer",
    penghasilan: "5-10",
    tinggiBadan: 175,
    beratBadan: 70,
    ciriFisik: "Berkulit Sawo Matang, Bermata Coklat",
    riwayatPenyakit: ["Alergi Debu"],
    anakKe: 2,
    saudaraKandung: 3,
    pekerjaanOrangTua: "Guru Dan Petani",
    avatar: null,
  },
  kondisiIbadah: {
    shalatFardu: "terjaga",
    shalatSunnah: "Sholat Dhuha Dan Tahajjud",
    bacaanQuran: "lancar",
    hafalanQuran: "Juz 30",
    puasa: "Puasa Senin Kamis",
    kajian: "Ustadz Ahmad Sarwat",
  },
  kriteriaPasangan: {
    usia: 25,
    pendidikan: "S1",
    penghasilan: "2-5",
    ciriFisik: "Sederhana Dan Sopan",
    kriteriaKhusus: ["Sholehah", "Mandiri", "Sabar"],
  },
  rencanaPernikahan: {
    tahunNikah: 2025,
    tempatTinggal: "Ikut Suami",
    visi: "Membangun Keluarga Sakinah Mawaddah Warahmah",
    misi: "Mendidik Anak-Anak Menjadi Generasi Qur'ani",
  },
  status: "approve",
  kodeKandidat: "IKHWAN00001",
};

export async function loadCvData(): Promise<CvData | null> {
  const user = await getUser();
  if (!user) return null;

  // Mock: Return mock data untuk testing
  if (user.id === "user123") {
    return mockCvData;
  }

  const stored = mockCvStorage.get(user.id);
  return stored || null;
}

export async function saveCvData(formData: FormData) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    // Extract form data
    const rawData = {
      biodata: {
        namaLengkap: formData.get("namaLengkap") as string,
        tanggalLahir: formData.get("tanggalLahir") as string,
        statusPernikahan: formData.get("statusPernikahan") as string,
        alamatLengkap: formData.get("alamatLengkap") as string,
        domisili: formData.get("domisili") as string,
        pendidikan: formData.get("pendidikan") as string,
        pekerjaan: formData.get("pekerjaan") as string,
        penghasilan: formData.get("penghasilan") as string,
        tinggiBadan: parseInt(formData.get("tinggiBadan") as string) || null,
        beratBadan: parseInt(formData.get("beratBadan") as string) || null,
        ciriFisik: formData.get("ciriFisik") as string,
        riwayatPenyakit: JSON.parse(
          (formData.get("riwayatPenyakit") as string) || "[]"
        ),
        anakKe: parseInt(formData.get("anakKe") as string) || null,
        saudaraKandung:
          parseInt(formData.get("saudaraKandung") as string) || null,
        pekerjaanOrangTua: formData.get("pekerjaanOrangTua") as string,
        avatar: null,
      },
      kondisiIbadah: {
        shalatFardu: formData.get("shalatFardu") as string,
        shalatSunnah: formData.get("shalatSunnah") as string,
        bacaanQuran: formData.get("bacaanQuran") as string,
        hafalanQuran: formData.get("hafalanQuran") as string,
        puasa: formData.get("puasa") as string,
        kajian: formData.get("kajian") as string,
      },
      kriteriaPasangan: {
        usia: parseInt(formData.get("kriteriaUsia") as string) || null,
        pendidikan: formData.get("kriteriaPendidikan") as string,
        penghasilan: formData.get("kriteriaPenghasilan") as string,
        ciriFisik: formData.get("kriteriaCiriFisik") as string,
        kriteriaKhusus: JSON.parse(
          (formData.get("kriteriaKhusus") as string) || "[]"
        ),
      },
      rencanaPernikahan: {
        tahunNikah: parseInt(formData.get("tahunNikah") as string) || null,
        tempatTinggal: formData.get("tempatTinggal") as string,
        visi: formData.get("visi") as string,
        misi: formData.get("misi") as string,
      },
    };

    // Validate data
    const validatedData = cvSchema.parse(rawData);

    // Normalize text data
    const normalizedData = normalizeCvData(validatedData);

    // Create CV data with status
    const cvData: CvData = {
      ...normalizedData,
      status: "review", // Always start with review status
    };

    // Mock: Save to storage
    mockCvStorage.set(user.id, cvData);

    return { success: true };
  } catch (error) {
    console.error("Error saving CV data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save CV data",
    };
  }
}

export async function getCvStatus(): Promise<{
  status: string;
  kodeKandidat?: string;
  adminNote?: string;
}> {
  const user = await getUser();
  if (!user) {
    return { status: "review" };
  }

  const cvData = await loadCvData();
  if (!cvData) {
    return { status: "review" };
  }

  return {
    status: cvData.status,
    kodeKandidat: cvData.kodeKandidat,
    adminNote: cvData.adminNote,
  };
}
