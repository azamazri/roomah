// /app/api/admin/cv-queue/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

const PAGINATION_SIZE = 10;

const mockList = [
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

export async function GET(req: Request) {
  try {
    assertAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const q = (searchParams.get("q") || "").toLowerCase();

    const filtered = q
      ? mockList.filter((x) => x.nama.toLowerCase().includes(q))
      : mockList;

    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGINATION_SIZE) || 1;
    const start = (page - 1) * PAGINATION_SIZE;
    const items = filtered.slice(start, start + PAGINATION_SIZE);

    await new Promise((r) => setTimeout(r, 300)); // simulasi delay

    return NextResponse.json({ items, total, totalPages, currentPage: page });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
