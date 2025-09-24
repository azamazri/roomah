import { z } from "zod";

export const biodataSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap harus diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
  statusPernikahan: z.enum(["Single", "Janda", "Duda"]),
  alamatLengkap: z.string().min(1, "Alamat lengkap harus diisi"),
  domisili: z.string().min(1, "Domisili harus diisi"),
  pendidikan: z.string().min(1, "Pendidikan harus diisi"),
  pekerjaan: z.string().min(1, "Pekerjaan harus diisi"),
  penghasilan: z.enum(["0-2", "2-5", "5-10", "10+", "Saat Taaruf"]),
  tinggiBadan: z
    .number()
    .min(100, "Tinggi badan minimal 100 cm")
    .max(250, "Tinggi badan maksimal 250 cm"),
  beratBadan: z
    .number()
    .min(30, "Berat badan minimal 30 kg")
    .max(200, "Berat badan maksimal 200 kg"),
  ciriFisik: z.string().max(200, "Ciri fisik maksimal 200 karakter"),
  riwayatPenyakit: z.array(z.string()).max(3, "Maksimal 3 riwayat penyakit"),
  anakKe: z.number().min(1).max(99).nullable(),
  saudaraKandung: z.number().min(0).max(99).nullable(),
  pekerjaanOrangTua: z.string().min(1, "Pekerjaan orang tua harus diisi"),
});

export const kondisiIbadahSchema = z.object({
  shalatFardu: z.enum(["terjaga", "kadang-kadang", "belum istiqomah"]),
  shalatSunnah: z.string(),
  bacaanQuran: z.enum(["lancar", "masih belajar", "belum bisa"]),
  hafalanQuran: z.string(),
  puasa: z.string(),
  kajian: z.string(),
});

export const kriteriaPasanganSchema = z.object({
  usia: z.number().min(17).max(50).nullable(),
  pendidikan: z.string().min(1, "Kriteria pendidikan harus diisi"),
  penghasilan: z.enum(["0-2", "2-5", "5-10", "10+", "Saat Taaruf"]),
  ciriFisik: z.string().max(200, "Ciri fisik maksimal 200 karakter"),
  kriteriaKhusus: z.array(z.string()).max(3, "Maksimal 3 kriteria khusus"),
});

export const rencanaPernikahanSchema = z.object({
  tahunNikah: z.number().min(2024).max(2050).nullable(),
  tempatTinggal: z.string().min(1, "Tempat tinggal harus diisi"),
  visi: z
    .string()
    .min(1, "Visi harus diisi")
    .max(200, "Visi maksimal 200 karakter"),
  misi: z
    .string()
    .min(1, "Misi harus diisi")
    .max(200, "Misi maksimal 200 karakter"),
});

export const cvSchema = z.object({
  biodata: biodataSchema,
  kondisiIbadah: kondisiIbadahSchema,
  kriteriaPasangan: kriteriaPasanganSchema,
  rencanaPernikahan: rencanaPernikahanSchema,
});
