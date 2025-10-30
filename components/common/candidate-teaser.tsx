import { listApprovedCandidates } from "@/server/services/candidates";
import { CandidateCard } from "./candidate-card";
import { Pagination } from "./pagination";
import { supabaseServer } from "@/lib/supabase/server";

// Tipe ringkas agar mapping fallback rapi
type CandidateSummary = {
  id: string;
  kodeKandidat: string;
  avatar: string | null;
  nama: string;
  umur: number;
  pekerjaan: string;
  domisili: string;
  pendidikan: string;
  kriteriaSingkat: string;
  status: "Siap Bertaaruf" | "Dalam Proses" | "Khitbah";
  tanggalLahir: string;
  statusPernikahan: "Single" | "Janda" | "Duda";
  penghasilan: "0-2" | "2-5" | "5-10" | "10+" | "Saat Taaruf";
  tinggiBadan: number;
  beratBadan: number;
  riwayatPenyakit: string[];
  gender: "M" | "F";
};

interface CandidateTeaserProps {
  page: number;
  pageSize: number;
  baseUrl?: string;
  currentUserId?: string;
  filters?: {
    gender?: string;
    ageRange?: string;
    education?: string;
    province?: string;
  };
}

export default async function CandidateTeaser({
  page,
  pageSize,
  baseUrl = "/",
  currentUserId,
  filters = {},
}: CandidateTeaserProps) {
  // Parse filters for service
  const serviceFilters: any = {};
  
  // Gender filter - IKHWAN/AKHWAT to MALE/FEMALE
  if (filters.gender) {
    if (filters.gender === "IKHWAN") {
      serviceFilters.gender = "MALE";
    } else if (filters.gender === "AKHWAT") {
      serviceFilters.gender = "FEMALE";
    }
  }
  
  // Education filter
  if (filters.education) {
    serviceFilters.education = filters.education;
  }
  
  // Province filter
  if (filters.province) {
    serviceFilters.provinceId = parseInt(filters.province);
  }
  
  // Age range filter (will be applied client-side for now)
  let ageMin: number | undefined;
  let ageMax: number | undefined;
  if (filters.ageRange) {
    const [min, max] = filters.ageRange.split('-');
    ageMin = parseInt(min);
    ageMax = max === '+' ? undefined : parseInt(max);
  }
  
  // 1) Sumber utama: service approved candidates with filters
  const primary = await listApprovedCandidates({
    page,
    limit: pageSize,
    excludeUserId: currentUserId,
    ...serviceFilters,
  });
  
  // Map Candidate objects to CandidateSummary
  let candidates: CandidateSummary[] = (primary.candidates || []).map((c: any) => {
    // Format tanggal lahir dari birth_date jika ada
    let tanggalLahir = "-";
    if (c.birth_date) {
      try {
        const date = new Date(c.birth_date);
        tanggalLahir = date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
      } catch (e) {
        tanggalLahir = "-";
      }
    }

    // Parse marital status dari enum
    let statusPernikahan: "Single" | "Janda" | "Duda" = "Single";
    if (c.marital_status === "JANDA") statusPernikahan = "Janda";
    else if (c.marital_status === "DUDA") statusPernikahan = "Duda";

    // Parse income bracket
    let penghasilan: "0-2" | "2-5" | "5-10" | "10+" | "Saat Taaruf" = "Saat Taaruf";
    if (c.income_bracket === "0_2") penghasilan = "0-2";
    else if (c.income_bracket === "2_5") penghasilan = "2-5";
    else if (c.income_bracket === "5_10") penghasilan = "5-10";
    else if (c.income_bracket === "10_PLUS") penghasilan = "10+";

    // Parse disease history - handle array, string, or null
    let riwayatPenyakit: string[] = [];
    if (Array.isArray(c.disease_history)) {
      riwayatPenyakit = c.disease_history.filter(Boolean);
    } else if (typeof c.disease_history === 'string' && c.disease_history.trim() !== '' && c.disease_history.toLowerCase() !== 'tidak ada') {
      riwayatPenyakit = [c.disease_history];
    }

    return {
      id: c.user_id || c.id,
      kodeKandidat: c.candidate_code || `K${(c.user_id || c.id).slice(0, 6).toUpperCase()}`,
      avatar: c.avatar_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cv-avatars/${c.avatar_path}` : null,
      nama: c.full_name || "Kandidat",
      umur: c.age || 0,
      pekerjaan: c.occupation || "-",
      domisili: c.province || "-",
      pendidikan: c.education || "-",
      kriteriaSingkat: `${c.education || "-"}`,
      status: c.taaruf_status === "DALAM_PROSES" ? "Dalam Proses" as const : "Siap Bertaaruf" as const,
      tanggalLahir,
      statusPernikahan,
      penghasilan,
      tinggiBadan: c.height_cm || 0,
      beratBadan: c.weight_kg || 0,
      riwayatPenyakit,
      gender: c.gender_label === "MALE" ? "M" as const : "F" as const,
    };
  });
  
  // Apply age filter client-side
  if (ageMin || ageMax) {
    candidates = candidates.filter(c => {
      if (ageMin && c.umur < ageMin) return false;
      if (ageMax && c.umur > ageMax) return false;
      return true;
    });
  }
  let totalPages = primary.totalPages ?? 1;

  // 2) Fallback: jika kosong (umumnya karena belum ada row di approved_candidates),
  //    ambil dari cv_data + cv_details (+profiles) agar kartu tetap muncul.
  if (!candidates || candidates.length === 0) {
    const sb = await supabaseServer();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // ambil data ringkas dari cv_data
    const { data: cvRows, count } = await sb
      .from("cv_data")
      .select(
        "user_id, full_name, birth_date, education, province_id, occupation, avatar_path",
        { count: "exact" }
      )
      .order("full_name", { ascending: true })
      .range(from, to);

    const userIds = (cvRows ?? []).map((r) => r.user_id);

    // tambahkan detail jika ada (cv_details uses JSONB structure)
    const [{ data: details }, { data: profiles }] = await Promise.all([
      sb
        .from("cv_details")
        .select("user_id, worship_profile, spouse_criteria, marriage_plan, private_notes")
        .in("user_id", userIds),
      sb.from("profiles").select("user_id, gender").in("user_id", userIds),
    ]);

    const byDt: Record<string, unknown> = Object.fromEntries(
      (details ?? []).map((d) => [(d as { user_id: string }).user_id, d])
    );
    const byPf: Record<string, unknown> = Object.fromEntries(
      (profiles ?? []).map((p) => [p.user_id, p])
    );

    // util avatar public (ganti bucket jika berbeda)
    const toAvatarUrl = (path?: string | null) => {
      if (!path) return null;
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return `${base}/storage/v1/object/public/cv-avatars/${encodeURIComponent(
        path
      )}`;
    };

    candidates = (cvRows ?? []).map((cv: unknown, idx: number) => {
      const dt = byDt[cv.user_id] || {};
      const pf = byPf[cv.user_id] || {};

      // kode kandidat sementara jika belum ada (mis. R0001, R0002… per halaman)
      const kode = `R${String(from + idx + 1).padStart(4, "0")}`;

      // Extract from JSONB if available (note: cv_details may not have these fields)
      const biodata = {};
      const physical = {};
      
      const marital = biodata.status_pernikahan || "Single";
      const birthDate = cv.birth_date || biodata.tanggal_lahir;
      const tgl = birthDate
        ? new Date(birthDate).toLocaleDateString("id-ID")
        : "-";
      
      // Calculate age from birth_date
      const calculateAge = (birthDateStr: string | null): number => {
        if (!birthDateStr) return 0;
        const today = new Date();
        const birth = new Date(birthDateStr);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      return {
        id: cv.user_id,
        kodeKandidat: kode,
        avatar: toAvatarUrl(cv.avatar_path),
        nama: cv.full_name ?? "-",
        umur: calculateAge(birthDate),
        pekerjaan: cv.occupation || biodata.pekerjaan || "-",
        domisili: "-", // Province name needs to be fetched from provinces table via province_id
        pendidikan: cv.education ?? biodata.pendidikan ?? "-",
        kriteriaSingkat: `${cv.education ?? "-"} | ${cv.occupation ?? "-"}`,
        status: "Siap Bertaaruf",
        tanggalLahir: tgl,
        statusPernikahan: marital as "Single" | "Janda" | "Duda",
        penghasilan: biodata.penghasilan || "Saat Taaruf",
        tinggiBadan: Number(physical.tinggi_cm ?? cv.height_cm ?? 0),
        beratBadan: Number(physical.berat_kg ?? cv.weight_kg ?? 0),
        riwayatPenyakit: Array.isArray(physical.riwayat_penyakit)
          ? physical.riwayat_penyakit
          : (cv.disease_history ? [cv.disease_history] : []),
        gender: (pf.gender as "M" | "F") ?? "M",
      } as CandidateSummary;
    });

    totalPages = Math.max(
      1,
      Math.ceil((count ?? candidates.length) / pageSize)
    );
  }

  // 3) UI tetap sama
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">
            Tidak ada kandidat ditemukan
          </h3>
          <p>Coba ubah filter pencarian Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid kandidat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            showTaarufButton={true}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl={baseUrl}
        />
      )}
    </div>
  );
}

