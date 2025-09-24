// /app/api/admin/cv-queue/[userId]/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

const mockDetails: Record<string, any> = {
  "user-001": {
    namaLengkap: "Ahmad Rahman bin Abdullah",
    gender: "M",
    tanggalLahir: "1995-03-15",
    asalDaerah: "Jakarta Selatan, DKI Jakarta",
    pendidikan: "S1 Teknik Informatika, Universitas Indonesia",
    pekerjaan: "Software Engineer di PT. Tech Indonesia",
    deskripsiDiri:
      "Seorang muslim yang konsisten menjalankan ibadah. Memiliki visi keluarga sakinah...",
  },
  "user-002": {
    namaLengkap: "Siti Aisyah binti Ahmad",
    gender: "F",
    tanggalLahir: "1997-08-22",
    asalDaerah: "Bandung, Jawa Barat",
    pendidikan: "S1 Psikologi, Universitas Padjadjaran",
    pekerjaan: "HR Manager di PT. Berkah Sejahtera",
    deskripsiDiri:
      "Muslimah yang istiqomah. Aktif dalam kegiatan dakwah dan sosial...",
  },
};

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertAdmin();
    const data = mockDetails[params.userId];
    await new Promise((r) => setTimeout(r, 200));
    if (!data) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(data);
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
