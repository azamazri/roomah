import { z } from "zod";

const diseaseSchema = z.object({
  name: z.string().min(1, "Nama penyakit tidak boleh kosong"),
});

export const onboardingCvSchema = z.object({
  birthDate: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  maritalStatus: z.enum(["Single", "Janda", "Duda"], {
    required_error: "Status pernikahan wajib dipilih",
  }),
  province: z.string().min(1, "Domisili provinsi wajib dipilih"),
  education: z.enum(["SMA/SMK", "Diploma", "S1", "S2", "S3"], {
    required_error: "Pendidikan wajib dipilih",
  }),
  job: z
    .string()
    .min(1, "Pekerjaan wajib diisi")
    .max(100, "Pekerjaan maksimal 100 karakter"),
  income: z.enum(["0-2 juta", "2-5 juta", "5-10 juta", "10+ juta"], {
    required_error: "Penghasilan wajib dipilih",
  }),
  height: z
    .number({ required_error: "Tinggi badan wajib diisi" })
    .int("Tinggi badan harus bilangan bulat")
    .min(120, "Tinggi badan minimal 120 cm")
    .max(220, "Tinggi badan maksimal 220 cm"),
  weight: z
    .number({ required_error: "Berat badan wajib diisi" })
    .int("Berat badan harus bilangan bulat")
    .min(30, "Berat badan minimal 30 kg")
    .max(200, "Berat badan maksimal 200 kg"),
  diseases: z
    .array(diseaseSchema)
    .max(3, "Maksimal 3 riwayat penyakit")
    .optional()
    .default([]),
});

export type OnboardingCvData = z.infer<typeof onboardingCvSchema>;
