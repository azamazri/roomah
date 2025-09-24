export interface BiodataLengkap {
  namaLengkap: string;
  tanggalLahir: string;
  statusPernikahan: "Single" | "Janda" | "Duda" | "";
  alamatLengkap: string;
  domisili: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: "0-2" | "2-5" | "5-10" | "10+" | "Saat Taaruf" | "";
  tinggiBadan: number | null;
  beratBadan: number | null;
  ciriFisik: string;
  riwayatPenyakit: string[];
  anakKe: number | null;
  saudaraKandung: number | null;
  pekerjaanOrangTua: string;
  avatar?: string | null;
}

export interface KondisiIbadah {
  shalatFardu: "terjaga" | "kadang-kadang" | "belum istiqomah" | "";
  shalatSunnah: string;
  bacaanQuran: "lancar" | "masih belajar" | "belum bisa" | "";
  hafalanQuran: string;
  puasa: string;
  kajian: string;
}

export interface KriteriaPasangan {
  usia: number | null;
  pendidikan: string;
  penghasilan: "0-2" | "2-5" | "5-10" | "10+" | "Saat Taaruf" | "";
  ciriFisik: string;
  kriteriaKhusus: string[];
}

export interface RencanaPernikahan {
  tahunNikah: number | null;
  tempatTinggal: string;
  visi: string;
  misi: string;
}

export interface CvData {
  biodata: BiodataLengkap;
  kondisiIbadah: KondisiIbadah;
  kriteriaPasangan: KriteriaPasangan;
  rencanaPernikahan: RencanaPernikahan;
  status: "review" | "approve" | "revisi";
  kodeKandidat?: string;
  adminNote?: string;
}
