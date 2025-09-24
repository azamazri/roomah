// features/candidates/server/list.ts
import { CandidateSummary } from "../types";

export type CandidateFilters = {
  ageMin?: number;
  ageMax?: number;
  education?: string; // dari filter 'pendidikan'
  province?: string; // dari filter 'provinsi'
  excludeGender?: "M" | "F"; // untuk user: sembunyikan gender ini → tampilkan lawan jenis
  gender?: "M" | "F"; // untuk guest: pilih gender eksplisit
};

// ---- Mock data kandidat (gender konsisten "M" | "F") ----
const mockCandidates: CandidateSummary[] = [
  {
    id: "c1",
    kodeKandidat: "AKHWAT00001",
    avatar: null,
    nama: "Fatimah Azzahra",
    umur: 25,
    pekerjaan: "Guru SD",
    domisili: "DKI Jakarta",
    pendidikan: "S1 Pendidikan",
    kriteriaSingkat: "Sholeh, bertanggung jawab",
    status: "Siap Bertaaruf",
    tanggalLahir: "1999-03-15",
    statusPernikahan: "Single",
    penghasilan: "2-5",
    tinggiBadan: 160,
    beratBadan: 50,
    riwayatPenyakit: [],
    gender: "F",
  },
  {
    id: "c2",
    kodeKandidat: "IKHWAN00001",
    avatar: null,
    nama: "Ahmad Fauzan",
    umur: 28,
    pekerjaan: "Software Engineer",
    domisili: "Jawa Barat",
    pendidikan: "S1 Teknik Informatika",
    kriteriaSingkat: "Sholehah, mandiri",
    status: "Siap Bertaaruf",
    tanggalLahir: "1996-07-20",
    statusPernikahan: "Single",
    penghasilan: "5-10",
    tinggiBadan: 175,
    beratBadan: 70,
    riwayatPenyakit: [],
    gender: "M",
  },
  {
    id: "c3",
    kodeKandidat: "AKHWAT00002",
    avatar: null,
    nama: "Siti Aisyah",
    umur: 23,
    pekerjaan: "Dokter",
    domisili: "Jawa Timur",
    pendidikan: "S1 Kedokteran",
    kriteriaSingkat: "Bertakwa, sabar",
    status: "Siap Bertaaruf",
    tanggalLahir: "2001-01-10",
    statusPernikahan: "Single",
    penghasilan: "5-10",
    tinggiBadan: 158,
    beratBadan: 48,
    riwayatPenyakit: [],
    gender: "F",
  },
  {
    id: "c4",
    kodeKandidat: "IKHWAN00002",
    avatar: null,
    nama: "Muhammad Ilham",
    umur: 30,
    pekerjaan: "Pengusaha",
    domisili: "Jawa Tengah",
    pendidikan: "S1 Ekonomi",
    kriteriaSingkat: "Taat beribadah",
    status: "Siap Bertaaruf",
    tanggalLahir: "1994-11-05",
    statusPernikahan: "Single",
    penghasilan: "10+",
    tinggiBadan: 172,
    beratBadan: 68,
    riwayatPenyakit: [],
    gender: "M",
  },
  {
    id: "c5",
    kodeKandidat: "AKHWAT00003",
    avatar: null,
    nama: "Khadijah Rahman",
    umur: 26,
    pekerjaan: "Apoteker",
    domisili: "Banten",
    pendidikan: "S1 Farmasi",
    kriteriaSingkat: "Istiqomah, ramah",
    status: "Siap Bertaaruf",
    tanggalLahir: "1998-05-22",
    statusPernikahan: "Single",
    penghasilan: "2-5",
    tinggiBadan: 162,
    beratBadan: 52,
    riwayatPenyakit: [],
    gender: "F",
  },
  {
    id: "c6",
    kodeKandidat: "IKHWAN00003",
    avatar: null,
    nama: "Yusuf Hakim",
    umur: 27,
    pekerjaan: "Insinyur",
    domisili: "DI Yogyakarta",
    pendidikan: "S1 Teknik Sipil",
    kriteriaSingkat: "Sholehah, sederhana",
    status: "Siap Bertaaruf",
    tanggalLahir: "1997-09-14",
    statusPernikahan: "Single",
    penghasilan: "5-10",
    tinggiBadan: 170,
    beratBadan: 65,
    riwayatPenyakit: [],
    gender: "M",
  },
  {
    id: "c7",
    kodeKandidat: "AKHWAT00004",
    avatar: null,
    nama: "Zahra Amelia",
    umur: 24,
    pekerjaan: "Desainer Grafis",
    domisili: "Sumatra Utara",
    pendidikan: "S1 DKV",
    kriteriaSingkat: "Kreatif, bertanggung jawab",
    status: "Siap Bertaaruf",
    tanggalLahir: "2000-04-18",
    statusPernikahan: "Single",
    penghasilan: "2-5",
    tinggiBadan: 155,
    beratBadan: 47,
    riwayatPenyakit: [],
    gender: "F",
  },
  {
    id: "c8",
    kodeKandidat: "IKHWAN00004",
    avatar: null,
    nama: "Ridwan Kamil",
    umur: 29,
    pekerjaan: "Arsitek",
    domisili: "Jawa Barat",
    pendidikan: "S1 Arsitektur",
    kriteriaSingkat: "Mandiri, kreatif",
    status: "Siap Bertaaruf",
    tanggalLahir: "1995-12-03",
    statusPernikahan: "Single",
    penghasilan: "5-10",
    tinggiBadan: 178,
    beratBadan: 72,
    riwayatPenyakit: [],
    gender: "M",
  },
];

// ---- Query helpers ----
function applyFilters(list: CandidateSummary[], f: CandidateFilters) {
  let out = [...list];

  if (f.excludeGender) {
    out = out.filter((c) => c.gender !== f.excludeGender);
  }
  if (f.gender) {
    out = out.filter((c) => c.gender === f.gender);
  }
  if (f.ageMin != null || f.ageMax != null) {
    out = out.filter((c) => {
      if (f.ageMin != null && c.umur < f.ageMin) return false;
      if (f.ageMax != null && c.umur > f.ageMax) return false;
      return true;
    });
  }
  if (f.education) {
    const q = f.education.toLowerCase();
    out = out.filter((c) => c.pendidikan.toLowerCase().includes(q));
  }
  if (f.province) {
    const q = f.province.toLowerCase();
    out = out.filter((c) => c.domisili.toLowerCase().includes(q));
  }

  return out;
}

// ---- Exports ----
export async function getCandidates(
  page: number = 1,
  pageSize: number = 6,
  filters: CandidateFilters = {}
) {
  const filtered = applyFilters(mockCandidates, filters);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    candidates: filtered.slice(start, start + pageSize),
    totalPages,
    currentPage,
    totalCount,
  };
}

export async function getCandidatesForUser(
  page: number = 1,
  filters: CandidateFilters = {}
) {
  // default pageSize 6 untuk tampilan grid 3x2
  return getCandidates(page, 6, filters);
}

export async function getCandidateById(
  id: string
): Promise<CandidateSummary | null> {
  const key = id.toLowerCase();
  const found =
    mockCandidates.find((c) => c.id.toLowerCase() === key) ??
    mockCandidates.find((c) => c.kodeKandidat.toLowerCase() === key);
  return found ?? null;
}

// Opsional: mapping dari URLSearchParams -> CandidateFilters
export function mapSearchParamsToFilters(
  sp: URLSearchParams,
  opts?: { userGender?: "M" | "F"; forceOpposite?: boolean }
): CandidateFilters {
  const f: CandidateFilters = {};

  // usia: "18-22" | "23-27" | "28-32" | "33+"
  const usia = sp.get("usia");
  if (usia) {
    if (usia.includes("-")) {
      const [min, max] = usia.split("-").map((n) => parseInt(n, 10));
      if (!Number.isNaN(min)) f.ageMin = min;
      if (!Number.isNaN(max)) f.ageMax = max;
    } else if (usia.endsWith("+")) {
      const min = parseInt(usia.replace("+", ""), 10);
      if (!Number.isNaN(min)) f.ageMin = min;
    }
  }

  const pendidikan = sp.get("pendidikan");
  if (pendidikan) f.education = pendidikan;

  const provinsi = sp.get("provinsi");
  if (provinsi) f.province = provinsi;

  const gender = sp.get("gender") as "M" | "F" | null;
  if (gender) f.gender = gender;

  if (opts?.userGender && opts.forceOpposite) {
    f.excludeGender = opts.userGender; // tampilkan lawan jenis
    delete f.gender;
  }

  return f;
}
