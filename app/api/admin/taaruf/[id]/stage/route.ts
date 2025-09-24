// /app/api/admin/taaruf/[id]/stage/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

const VALID = [
  "Pengajuan",
  "Screening",
  "Zoom 1",
  "Zoom 2",
  "Keputusan",
  "Selesai",
];

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    assertAdmin();
    const { newStage } = await req.json();
    if (!VALID.includes(newStage))
      return new NextResponse("Invalid stage", { status: 400 });

    // TODO: update DB stage
    console.log(`Updating taaruf ${params.id} to ${newStage}`);
    // update status user-facing (mock)
    console.log(`Updating user-facing status for ${params.id}`);

    revalidateTag("taaruf-kanban");
    revalidateTag("dashboard-kpi");
    revalidateTag(`taaruf-${params.id}`);

    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
