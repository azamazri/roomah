// /app/api/admin/cv-queue/[userId]/revise/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertAdmin();
    const { note } = await req.json();
    if (!note || !note.trim()) {
      return new NextResponse("Note is required", { status: 400 });
    }
    // TODO: update DB status -> revisi + simpan note
    console.log(`Revising CV for ${params.userId} with note: ${note}`);
    revalidateTag("cv-verification");
    revalidateTag(`user-${params.userId}-cv`);
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
