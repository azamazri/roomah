// /app/api/admin/accounts/[userId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

// ambil sebagian dari list + mock aktivitas
const base = new Map<string, any>([
  [
    "user-001",
    {
      userId: "user-001",
      email: "ahmad.rahman@email.com",
      nama: "Ahmad Rahman",
      gender: "M",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      statusCv: "approve",
      coinBalance: 15,
    },
  ],
  [
    "user-002",
    {
      userId: "user-002",
      email: "siti.aisyah@email.com",
      nama: "Siti Aisyah",
      gender: "F",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      statusCv: "review",
      coinBalance: 10,
    },
  ],
  [
    "user-004",
    {
      userId: "user-004",
      email: "fatimah.azzahra@email.com",
      nama: "Fatimah Azzahra",
      gender: "F",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      statusCv: "approve",
      coinBalance: 25,
    },
  ],
]);

const activities: Record<string, any[]> = {
  "user-001": [
    {
      type: "taaruf_ajukan",
      id: "taaruf-req-001",
      at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      targetKode: "RF002",
    },
    {
      type: "coin_topup",
      id: "topup-001",
      at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      amount: 50000,
      provider: "midtrans",
    },
    {
      type: "cv_update",
      at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
  "user-002": [
    {
      type: "cv_update",
      at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      type: "coin_topup",
      id: "topup-002",
      at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      amount: 25000,
      provider: "midtrans",
    },
  ],
  "user-004": [
    {
      type: "taaruf_ajukan",
      id: "taaruf-req-002",
      at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      targetKode: "RM005",
    },
    {
      type: "coin_topup",
      id: "topup-003",
      at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      amount: 100000,
      provider: "midtrans",
    },
    {
      type: "cv_update",
      at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
};

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } } // TERIMA SELURUH CONTEXT SEBAGAI SATU ARGUMEN
) {
  try {
    // AMBIL PARAMS DARI DALAM FUNGSI
    const { userId } = context.params;

    assertAdmin();
    const info = base.get(userId); // Gunakan userId yang sudah diekstrak
    await new Promise((r) => setTimeout(r, 200));

    if (!info) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const acts = (activities[userId] || []).sort(
      (a, b) => +new Date(b.at) - +new Date(a.at)
    );

    return NextResponse.json({ ...info, activities: acts });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
