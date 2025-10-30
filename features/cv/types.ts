export interface BiodataLengkap {
  avatar?: string;
  namaLengkap: string;
  tanggalLahir: string;
  jenisKelamin: string;
  statusPernikahan: string;
  domisili: string;
  alamatLengkap: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
  tinggiBadan: string;
  beratBadan: string;
  ciriFisik: string;
  riwayatPenyakit: string[];
  keberadaanOrangTua: string;
  pekerjaanOrangTua: string;
  anakKe: string;
  saudaraKandung: string;
}

export interface LatarBelakangKeluarga {
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  jumlahSaudara: string;
  anakKe: string;
}

export interface KondisiIbadah {
  shalat: string;
  shaum: string;
  tilawah: string;
  tahajud: string;
  kebiasaanIbadah: string;
  shalatFardu: string;
  bacaanQuran: string;
  shalatSunnah: string;
  hafalanQuran: string;
  puasa: string;
  kajian: string;
}

export interface KriteriaPasangan {
  usia: string;
  pendidikan: string;
  pekerjaan: string;
  sifatKepribadian: string;
  kriteriaKhusus: string[];
  usiaCriteria: string;
  pendidikanCriteria: string;
  penghasilanCriteria: string;
  penghasilan: string;
  ciriFisik: string;
}

export interface RencanaPernikahan {
  target: string;
  persiapan: string;
  lokasiTinggal: string;
  visiPernikahan: string;
  tahunNikah: string;
  tempatTinggal: string;
  visi: string;
  misi: string;
}

export interface CvData {
  status: string;
  kodeKandidat?: string;
  adminNote?: string;
  biodata: BiodataLengkap;
  latarBelakangKeluarga: LatarBelakangKeluarga;
  kondisiIbadah: KondisiIbadah;
  kriteriaPasangan: KriteriaPasangan;
  rencanaPernikahan: RencanaPernikahan;
}
