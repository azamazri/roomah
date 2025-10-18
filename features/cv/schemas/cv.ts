import { z } from "zod";

/**
 * CV SCHEMAS - ROOMAH MVP
 * 6 Kategori: Biodata Lengkap, Kondisi Fisik, Latar Belakang Keluarga, 
 * Ibadah, Kriteria Pasangan, Rencana Pernikahan
 */

// ============================================================================
// KATEGORI 1: BIODATA LENGKAP
// ============================================================================
export const cvBiodataSchema = z.object({
  fullName: z.string()
    .min(1, "Nama lengkap tidak boleh kosong")
    .max(200, "Nama maksimal 200 karakter"),
  
  birthDate: z.string()
    .refine((val) => !isNaN(new Date(val).getTime()), "Tanggal lahir tidak valid"),
  
  maritalStatus: z.enum(["SINGLE", "JANDA", "DUDA"], {
    errorMap: () => ({ message: "Pilih status pernikahan" })
  }),
  
  fullAddress: z.string()
    .min(1, "Alamat tidak boleh kosong")
    .max(500, "Alamat maksimal 500 karakter"),
  
  provinceId: z.number()
    .int("Provinsi harus berupa angka")
    .positive("Pilih provinsi"),
  
  education: z.enum(["SMA_SMK", "D3", "S1", "S2", "S3"], {
    errorMap: () => ({ message: "Pilih pendidikan terakhir" })
  }),
  
  occupation: z.string()
    .min(1, "Pekerjaan tidak boleh kosong")
    .max(100, "Pekerjaan maksimal 100 karakter"),
  
  incomeBracket: z.enum(["SAAT_TAARUF", "0_2", "2_5", "5_10", "10_PLUS"], {
    errorMap: () => ({ message: "Pilih rentang penghasilan" })
  })
});

// ============================================================================
// KATEGORI 2: KONDISI FISIK
// ============================================================================
export const cvKondisiFisikSchema = z.object({
  heightCm: z.number()
    .int("Tinggi harus angka bulat")
    .min(100, "Tinggi minimal 100 cm")
    .max(250, "Tinggi maksimal 250 cm"),
  
  weightKg: z.number()
    .int("Berat harus angka bulat")
    .min(30, "Berat minimal 30 kg")
    .max(200, "Berat maksimal 200 kg"),
  
  ciriFisik: z.string()
    .max(100, "Ciri fisik maksimal 100 karakter")
    .refine(
      (val) => val.split(/\s+/).filter(Boolean).length <= 20,
      "Ciri fisik maksimal 20 kata"
    ),
  
  diseaseHistory: z.array(z.string().max(200))
    .max(3, "Maksimal 3 riwayat penyakit")
    .optional()
    .default([])
});

// ============================================================================
// KATEGORI 3: LATAR BELAKANG KELUARGA
// ============================================================================
export const cvLatarBelakangKeluargaSchema = z.object({
  parentStatus: z.enum(["HIDUP_KEDUANYA", "YATIM", "PIATU", "YATIM_PIATU"], {
    errorMap: () => ({ message: "Pilih status orang tua" })
  }),
  
  parentOccupation: z.string()
    .min(1, "Pekerjaan orang tua tidak boleh kosong")
    .max(100, "Pekerjaan orang tua maksimal 100 karakter"),
  
  siblingOrder: z.number()
    .int("Anak ke- harus angka bulat")
    .min(1, "Anak ke- minimal 1")
    .max(99, "Anak ke- maksimal 99"),
  
  siblingTotal: z.number()
    .int("Jumlah saudara harus angka bulat")
    .min(1, "Jumlah saudara minimal 1")
    .max(99, "Jumlah saudara maksimal 99")
}).refine(
  (data) => data.siblingOrder <= data.siblingTotal,
  {
    message: "Anak ke- tidak boleh lebih besar dari jumlah saudara",
    path: ["siblingOrder"]
  }
);

// ============================================================================
// KATEGORI 4: IBADAH
// ============================================================================
export const cvIbadahSchema = z.object({
  salatStatus: z.enum(["TERJAGA", "KADANG", "BELUM_ISTIQOMAH"], {
    errorMap: () => ({ message: "Pilih status shalat" })
  }),
  
  quranAbility: z.enum(["LANCAR", "BELAJAR", "BELUM_BISA"], {
    errorMap: () => ({ message: "Pilih kemampuan baca Quran" })
  }),
  
  fasting: z.string()
    .max(200, "Deskripsi puasa maksimal 200 karakter")
    .optional()
    .default(""),
  
  otherIbadah: z.array(z.string().max(200))
    .max(3, "Maksimal 3 ibadah lainnya")
    .optional()
    .default([])
});

// ============================================================================
// KATEGORI 5: KRITERIA PASANGAN
// ============================================================================
export const cvKriteriaPasanganSchema = z.object({
  ageRange: z.string()
    .max(50, "Rentang usia maksimal 50 karakter")
    .optional()
    .default(""),
  
  education: z.enum(["SMA_SMK", "D3", "S1", "S2", "S3"], {
    errorMap: () => ({ message: "Pilih pendidikan" })
  }).optional(),
  
  incomeBracket: z.enum(["SAAT_TAARUF", "0_2", "2_5", "5_10", "10_PLUS"], {
    errorMap: () => ({ message: "Pilih penghasilan" })
  }).optional(),
  
  location: z.string()
    .max(200, "Lokasi maksimal 200 karakter")
    .optional()
    .default(""),
  
  otherCriteria: z.array(z.string().max(200))
    .max(3, "Maksimal 3 kriteria lainnya")
    .optional()
    .default([])
});

// ============================================================================
// KATEGORI 6: RENCANA PERNIKAHAN
// ============================================================================
export const cvRencanaPernikahanSchema = z.object({
  marriageYear: z.number()
    .int("Tahun harus angka bulat")
    .min(2025, "Tahun minimal 2025")
    .max(2100, "Tahun maksimal 2100"),
  
  livingPlan: z.string()
    .min(1, "Rencana tempat tinggal tidak boleh kosong")
    .max(200, "Rencana tempat tinggal maksimal 200 karakter"),
  
  vision: z.string()
    .min(1, "Visi tidak boleh kosong")
    .max(200, "Visi maksimal 200 karakter")
    .refine(
      (val) => val.split(/\s+/).filter(Boolean).length <= 20,
      "Visi maksimal 20 kata"
    ),
  
  mission: z.string()
    .min(1, "Misi tidak boleh kosong")
    .max(200, "Misi maksimal 200 karakter")
    .refine(
      (val) => val.split(/\s+/).filter(Boolean).length <= 20,
      "Misi maksimal 20 kata"
    )
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type CvBiodataInput = z.infer<typeof cvBiodataSchema>;
export type CvKondisiFisikInput = z.infer<typeof cvKondisiFisikSchema>;
export type CvLatarBelakangKeluargaInput = z.infer<typeof cvLatarBelakangKeluargaSchema>;
export type CvIbadahInput = z.infer<typeof cvIbadahSchema>;
export type CvKriteriaPasanganInput = z.infer<typeof cvKriteriaPasanganSchema>;
export type CvRencanaPernikahanInput = z.infer<typeof cvRencanaPernikahanSchema>;
