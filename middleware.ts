import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // cookies
  const authCookie = request.cookies.get("rmh_auth")?.value; // "1" kalau logged-in (user/admin sama)
  const fiveQCookie = request.cookies.get("rmh_5q")?.value; // "1" kalau verifikasi 5Q selesai
  const cvCookie = request.cookies.get("rmh_cv")?.value; // "0" / "1" status onboarding CV user
  const adminCookie = request.cookies.get("rmh_admin")?.value; // "1" kalau session admin

  const isAuthenticated = authCookie === "1";
  const isAdmin = adminCookie === "1";
  const fiveQCompleted = fiveQCookie === "1";
  const onboardingComplete =
    fiveQCompleted && (cvCookie === "0" || cvCookie === "1");

  // --- Helper route checks ---
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // User area (bukan pakai /(app), tapi path konkrit)
  const USER_APP_PREFIXES = [
    "/cari-jodoh",
    "/cv-saya",
    "/riwayat-taaruf",
    "/koin-saya",
    "/onboarding",
  ];
  const isUserAppRoute = USER_APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // --- ADMIN GUARDS ---
  if (isAdminRoute) {
    // izinkan halaman login admin selalu bisa diakses
    if (isAdminLogin) {
      // kalau sudah admin & sudah login → lempar ke dashboard (kecuali ada ?next)
      if (isAuthenticated && isAdmin) {
        const next = searchParams.get("next") || "/admin/dashboard";
        const url = request.nextUrl.clone();
        url.pathname = next;
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // selain /admin/login, semua /admin/** wajib admin
    if (!isAuthenticated || !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // admin valid → lanjut
    return NextResponse.next();
  }

  // --- USER APP GUARDS (onboarding) ---
  if (isUserAppRoute) {
    // semua user area wajib login user (admin pun butuh rmh_auth=1)
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // onboarding flow user (hanya berlaku untuk path /onboarding atau halaman app user)
    const isOnboardingRoute = pathname.startsWith("/onboarding");
    if (!onboardingComplete) {
      if (!fiveQCompleted) {
        if (pathname !== "/onboarding/verifikasi") {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding/verifikasi";
          return NextResponse.redirect(url);
        }
      } else if (cvCookie !== "0" && cvCookie !== "1") {
        if (pathname !== "/onboarding/cv") {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding/cv";
          return NextResponse.redirect(url);
        }
      }
    } else if (isOnboardingRoute) {
      // kalau onboarding sudah beres, jangan biarkan akses /onboarding
      const url = request.nextUrl.clone();
      url.pathname = "/cari-jodoh";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // --- AUTH ROUTES (login/register) redirect jika sudah login user ---
  if (isAuthRoute && isAuthenticated) {
    if (!onboardingComplete) {
      const url = request.nextUrl.clone();
      url.pathname = !fiveQCompleted
        ? "/onboarding/verifikasi"
        : "/onboarding/cv";
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/cari-jodoh";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Sudah cukup luas dan termasuk /admin/**
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
