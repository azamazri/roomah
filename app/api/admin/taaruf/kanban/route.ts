// /app/api/admin/taaruf/kanban/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";

const STAGES = [
  "Pengajuan",
  "Screening",
  "Zoom 1",
  "Zoom 2",
  "Keputusan",
  "Selesai",
] as const;

const mock = [
  {
    id: "taaruf-001",
    pasanganKode: ["RM001", "RF002"],
    stage: "Pengajuan",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "taaruf-002",
    pasanganKode: ["RM003", "RF004"],
    stage: "Pengajuan",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "taaruf-003",
    pasanganKode: ["RM005", "RF006"],
    stage: "Screening",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: "taaruf-004",
    pasanganKode: ["RM007", "RF008"],
    stage: "Screening",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "taaruf-005",
    pasanganKode: ["RM009", "RF010"],
    stage: "Zoom 1",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "taaruf-006",
    pasanganKode: ["RM011", "RF012"],
    stage: "Zoom 2",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "taaruf-007",
    pasanganKode: ["RM013", "RF014"],
    stage: "Keputusan",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: "taaruf-008",
    pasanganKode: ["RM015", "RF016"],
    stage: "Selesai",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "taaruf-009",
    pasanganKode: ["RM017", "RF018"],
    stage: "Selesai",
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export async function GET() {
  try {
    assertAdmin();
    await new Promise((r) => setTimeout(r, 400));
    const grouped = STAGES.reduce((acc: any, s) => {
      acc[s] = mock.filter((m) => m.stage === s);
      return acc;
    }, {});
    return NextResponse.json(grouped);
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
