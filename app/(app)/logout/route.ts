// app/(app)/logout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const res = NextResponse.redirect(new URL("/", req.url));
  // Bersihkan sisa cookie custom lama (kalau dulu sempat dipakai)
  ["rmh_auth", "rmh_admin", "rmh_5q", "rmh_cv"].forEach((name) =>
    res.cookies.set(name, "", { path: "/", expires: new Date(0) })
  );
  return res;
}
export async function POST(req: Request) {
  return GET(req);
}
