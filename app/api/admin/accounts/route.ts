// /app/api/admin/accounts/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

const PAGINATION_SIZE = 10;

const accounts = [
  {
    userId: "user-001",
    email: "ahmad.rahman@email.com",
    nama: "Ahmad Rahman",
    gender: "M",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    statusCv: "approve",
    coinBalance: 15,
  },
  {
    userId: "user-002",
    email: "siti.aisyah@email.com",
    nama: "Siti Aisyah",
    gender: "F",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    statusCv: "review",
    coinBalance: 10,
  },
  {
    userId: "user-003",
    email: "muhammad.faisal@email.com",
    nama: "Muhammad Faisal",
    gender: "M",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    statusCv: "revisi",
    coinBalance: 5,
  },
  {
    userId: "user-004",
    email: "fatimah.azzahra@email.com",
    nama: "Fatimah Azzahra",
    gender: "F",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    statusCv: "approve",
    coinBalance: 25,
  },
  {
    userId: "user-005",
    email: "abdullah.ibrahim@email.com",
    nama: "Abdullah Ibrahim",
    gender: "M",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    statusCv: "review",
    coinBalance: 0,
  },
  {
    userId: "user-006",
    email: "khadijah.ummu@email.com",
    nama: "Khadijah Ummu...",
    gender: "F",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    statusCv: "approve",
    coinBalance: 30,
  },
];

export async function GET(req: Request) {
  try {
    assertAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const q = (searchParams.get("q") || "").toLowerCase();

    const filtered = q
      ? accounts.filter(
          (a) =>
            a.nama.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q)
        )
      : accounts;

    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGINATION_SIZE) || 1;
    const start = (page - 1) * PAGINATION_SIZE;
    const items = filtered.slice(start, start + PAGINATION_SIZE);

    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ items, total, totalPages, currentPage: page });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
