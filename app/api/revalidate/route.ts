// app/api/revalidate/route.ts
import { NextResponse } from "next/server";
export async function POST() {
  // Nanti: admin-protected revalidate
  return NextResponse.json({ revalidated: true });
}
