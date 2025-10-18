import { z } from "zod";

/**
 * Onboarding 5Q Verification Schema
 * Requirements: 5 pertanyaan keseriusan taaruf
 */
export const onboarding5QSchema = z.object({
  q1: z.boolean({
    required_error: "Pertanyaan 1 harus dijawab",
    invalid_type_error: "Jawaban harus Ya atau Tidak"
  }),
  q2: z.boolean({
    required_error: "Pertanyaan 2 harus dijawab",
    invalid_type_error: "Jawaban harus Ya atau Tidak"
  }),
  q3: z.boolean({
    required_error: "Pertanyaan 3 harus dijawab",
    invalid_type_error: "Jawaban harus Ya atau Tidak"
  }),
  q4: z.boolean({
    required_error: "Pertanyaan 4 harus dijawab",
    invalid_type_error: "Jawaban harus Ya atau Tidak"
  }),
  q5: z.boolean({
    required_error: "Pertanyaan 5 harus dijawab",
    invalid_type_error: "Jawaban harus Ya atau Tidak"
  }),
  committed: z.boolean().default(false) // If any answer is false, need commitment popup
});

/**
 * Check if 5Q verification passed
 * If any answer is false, need to show commitment popup
 */
export function check5QVerification(data: z.infer<typeof onboarding5QSchema>): {
  passed: boolean;
  needsCommitment: boolean;
} {
  const allPositive = data.q1 && data.q2 && data.q3 && data.q4 && data.q5;
  
  if (allPositive) {
    return { passed: true, needsCommitment: false };
  }
  
  // Has negative answers - needs commitment
  if (data.committed) {
    return { passed: true, needsCommitment: false }; // Committed to continue
  }
  
  return { passed: false, needsCommitment: true }; // Show popup
}

/**
 * Onboarding CV Wajib Schema
 * Requirements: Jenis Kelamin, Tanggal Lahir, Domisili Provinsi, Pendidikan, Pekerjaan
 */
export const onboardingCvWajibSchema = z.object({
  gender: z.enum(["IKHWAN", "AKHWAT"], {
    errorMap: () => ({ message: "Pilih jenis kelamin" })
  }),
  birthDate: z.string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Tanggal lahir tidak valid")
    .refine((val) => {
      const birth = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      return age >= 17;
    }, "Usia minimal 17 tahun"),
  provinceId: z.number({
    required_error: "Pilih provinsi domisili",
    invalid_type_error: "Provinsi tidak valid"
  }).int().positive(),
  education: z.enum(["SMA_SMK", "D3", "S1", "S2", "S3"], {
    errorMap: () => ({ message: "Pilih pendidikan terakhir" })
  }),
  occupation: z.string()
    .min(1, "Pekerjaan tidak boleh kosong")
    .max(100, "Pekerjaan maksimal 100 karakter")
});

export type Onboarding5QInput = z.infer<typeof onboarding5QSchema>;
export type OnboardingCvWajibInput = z.infer<typeof onboardingCvWajibSchema>;
