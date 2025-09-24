import { revalidateTag } from "next/cache";
import type { CvQueueItem, CvReviewAction } from "../types";
import { PAGINATION_SIZE } from "../constants";

interface CvListResponse {
  items: CvQueueItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listPendingCv(
  page: number = 1,
  query: string = ""
): Promise<CvListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - replace with actual database queries
  const mockData: CvQueueItem[] = [
    {
      userId: "user-001",
      nama: "Ahmad Rahman",
      gender: "M",
      submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "review",
    },
    {
      userId: "user-002",
      nama: "Siti Aisyah",
      gender: "F",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "review",
    },
    {
      userId: "user-003",
      nama: "Muhammad Faisal",
      gender: "M",
      submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      status: "review",
    },
    {
      userId: "user-004",
      nama: "Fatimah Azzahra",
      gender: "F",
      submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: "review",
    },
    {
      userId: "user-005",
      nama: "Abdullah Ibrahim",
      gender: "M",
      submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: "review",
    },
  ];

  // Filter by query
  const filtered = query
    ? mockData.filter((item) =>
        item.nama.toLowerCase().includes(query.toLowerCase())
      )
    : mockData;

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGINATION_SIZE);
  const start = (page - 1) * PAGINATION_SIZE;
  const items = filtered.slice(start, start + PAGINATION_SIZE);

  return {
    items,
    total,
    totalPages,
    currentPage: page,
  };
}

export async function getCvDetail(userId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock data - replace with actual database query
  const mockDetails = {
    "user-001": {
      namaLengkap: "Ahmad Rahman bin Abdullah",
      gender: "M" as const,
      tanggalLahir: "1995-03-15",
      asalDaerah: "Jakarta Selatan, DKI Jakarta",
      pendidikan: "S1 Teknik Informatika, Universitas Indonesia",
      pekerjaan: "Software Engineer di PT. Tech Indonesia",
      deskripsiDiri:
        "Seorang muslim yang konsisten menjalankan ibadah. Memiliki visi untuk membangun keluarga sakinah mawaddah warahmah. Hobi membaca Al-Quran dan mengikuti kajian agama. Menyukai teknologi dan programming.",
    },
    "user-002": {
      namaLengkap: "Siti Aisyah binti Ahmad",
      gender: "F" as const,
      tanggalLahir: "1997-08-22",
      asalDaerah: "Bandung, Jawa Barat",
      pendidikan: "S1 Psikologi, Universitas Padjadjaran",
      pekerjaan: "HR Manager di PT. Berkah Sejahtera",
      deskripsiDiri:
        "Muslimah yang menjalankan syariat Islam dengan istiqomah. Bercita-cita menjadi istri dan ibu yang sholehah. Aktif dalam kegiatan dakwah dan sosial. Menyukai memasak dan membaca buku-buku islami.",
    },
  };

  const detail = mockDetails[userId as keyof typeof mockDetails];
  if (!detail) {
    throw new Error("CV detail not found");
  }

  return detail;
}

export async function approveCv(userId: string): Promise<void> {
  // TODO: Implement actual database update

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate candidate code
  const candidateCode = generateCandidateCode();

  // Mock: Update CV status to 'approve' and assign candidate code
  console.log(`Approving CV for user ${userId} with code ${candidateCode}`);

  // Revalidate related cache tags
  revalidateTag("cv-verification");
  revalidateTag("dashboard-kpi");
  revalidateTag(`user-${userId}-cv`);
}

export async function reviseCv(userId: string, note: string): Promise<void> {
  // TODO: Implement actual database update

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock: Update CV status to 'revisi' and save note
  console.log(`Revising CV for user ${userId} with note: ${note}`);

  // Revalidate related cache tags
  revalidateTag("cv-verification");
  revalidateTag(`user-${userId}-cv`);
}

function generateCandidateCode(): string {
  // Generate format: RM001, RF001, etc.
  const prefix = Math.random() > 0.5 ? "RM" : "RF"; // M for Male, F for Female
  const number = Math.floor(Math.random() * 999) + 1;
  return `${prefix}${number.toString().padStart(3, "0")}`;
}
