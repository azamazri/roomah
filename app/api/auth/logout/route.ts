import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Clear user session and sign out
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Sign out user
    await supabase.auth.signOut();

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear all Supabase cookies (pattern matches sb-*-auth-token*)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.delete(cookie.name);
      }
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Alternative logout for direct browser access
 */
export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Redirect to homepage after logout
    const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
    
    // Clear all Supabase cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.delete(cookie.name);
      }
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
}
