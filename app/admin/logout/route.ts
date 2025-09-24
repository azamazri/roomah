// app/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/admin/login", request.url);
  const res = NextResponse.redirect(url);

  // Hapus cookie sesi admin
  res.cookies.set("rmh_auth", "", { path: "/", expires: new Date(0) });
  res.cookies.set("rmh_admin", "", { path: "/", expires: new Date(0) });

  return res;
}
