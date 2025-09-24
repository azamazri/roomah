// /app/api/admin/coins/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

const PAGINATION_SIZE = 10;

const data = [
  {
    id: "tx-001",
    userId: "user-12345678",
    amount: 50000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "tx-002",
    userId: "user-87654321",
    amount: 100000,
    status: "pending",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "tx-003",
    userId: "user-11111111",
    amount: 25000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "tx-004",
    userId: "user-22222222",
    amount: 75000,
    status: "deny",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "tx-005",
    userId: "user-33333333",
    amount: 50000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "tx-006",
    userId: "user-44444444",
    amount: 200000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "tx-007",
    userId: "user-55555555",
    amount: 30000,
    status: "pending",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: "tx-008",
    userId: "user-66666666",
    amount: 150000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "tx-009",
    userId: "user-77777777",
    amount: 80000,
    status: "deny",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "tx-010",
    userId: "user-88888888",
    amount: 120000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "tx-011",
    userId: "user-99999999",
    amount: 60000,
    status: "settlement",
    provider: "midtrans",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    assertAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    let filtered = status ? data.filter((d) => d.status === status) : [...data];

    if (from) {
      const f = new Date(from);
      filtered = filtered.filter((d) => new Date(d.createdAt) >= f);
    }
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      filtered = filtered.filter((d) => new Date(d.createdAt) <= t);
    }

    filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

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
