// app/admin/logout/route.ts
import { NextResponse } from "next/server";
import { supabaseAction } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await supabaseAction();
  await supabase.auth.signOut();

  const url = new URL("/admin/login", request.url);
  const res = NextResponse.redirect(url);
  return res;
}
