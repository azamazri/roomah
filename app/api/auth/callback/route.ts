// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "auth callback placeholder" });
}
