// app/api/midtrans/webhook/route.ts
import { NextResponse } from "next/server";
export async function POST() {
  // Nanti: verifikasi signature + idempotensi
  return NextResponse.json({ status: "webhook received (placeholder)" });
}
