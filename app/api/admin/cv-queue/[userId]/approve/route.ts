// /app/api/admin/cv-queue/[userId]/approve/route.ts
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

function generateCandidateCode() {
  const prefix = Math.random() > 0.5 ? "RM" : "RF";
  const num = Math.floor(Math.random() * 999) + 1;
  return `${prefix}${num.toString().padStart(3, "0")}`;
}

export async function POST(
  _: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertAdmin();
    // TODO: update DB status -> approve + simpan candidate code
    const code = generateCandidateCode();
    console.log(`Approving CV for ${params.userId} with code ${code}`);
    // cache revalidation hanya di server:
    revalidateTag("cv-verification");
    revalidateTag("dashboard-kpi");
    revalidateTag(`user-${params.userId}-cv`);
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: true, code });
  } catch (e: any) {
    return new NextResponse(e.message || "Unauthorized", {
      status: e.status || 500,
    });
  }
}
