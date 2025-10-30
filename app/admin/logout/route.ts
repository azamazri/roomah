// app/admin/logout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Admin Logout Route
 * - Signs out the user from Supabase
 * - Clears all auth cookies
 * - Redirects to admin login page
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
    }

    // Clear cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Remove all Supabase auth cookies
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
      }
    });

    // Redirect to admin login
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("message", "Anda telah berhasil logout");
    
    const response = NextResponse.redirect(url);
    
    // Additional cookie cleanup in response headers
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;
  } catch (error) {
    console.error("Logout route error:", error);
    
    // Still redirect to login even if there's an error
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }
}

// Also handle POST method for flexibility
export async function POST(request: Request) {
  return GET(request);
}
