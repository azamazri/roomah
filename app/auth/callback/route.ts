import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Callback Handler for OAuth (Google)
 * 
 * Flow Logic:
 * 1. User clicks "Login with Google" → redirects to Google
 * 2. Google redirects back here with code
 * 3. Exchange code for session
 * 4. Check if user exists in profiles
 * 5. If exists → continue to app
 * 6. If new → redirect to onboarding
 * 7. Handle errors appropriately
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const isRegisterFlow = requestUrl.searchParams.get("flow") === "register";

  // If no code, something went wrong
  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed&message=${encodeURIComponent(
        "OAuth callback tidak valid"
      )}`
    );
  }

  const supabase = await createClient();

  // Exchange code for session
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth exchange error:", exchangeError);
    return NextResponse.redirect(
      `${origin}/login?error=oauth_exchange_failed&message=${encodeURIComponent(
        "Gagal memproses login Google"
      )}`
    );
  }

  const user = data.user;

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=no_user&message=${encodeURIComponent(
        "User tidak ditemukan"
      )}`
    );
  }

  // Check if profile exists in our database
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name, registered_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Case 1: LOGIN FLOW - User exists but trying to login with Google
  if (!isRegisterFlow) {
    // If profile doesn't exist, they need to register first
    if (!profile) {
      // Sign out the user since they don't have a profile
      await supabase.auth.signOut();
      
      return NextResponse.redirect(
        `${origin}/login?error=account_not_found&message=${encodeURIComponent(
          "Akun Google ini belum terdaftar. Silakan registrasi terlebih dahulu."
        )}`
      );
    }

    // Profile exists, check if onboarding completed
    if (!profile.registered_at) {
      // Has profile but not registered → continue onboarding
      return NextResponse.redirect(`${origin}/onboarding/verifikasi`);
    }

    // All good, redirect to app
    return NextResponse.redirect(`${origin}/cari-jodoh`);
  }

  // Case 2: REGISTER FLOW - User trying to register with Google
  if (isRegisterFlow) {
    // If profile already exists, can't register again
    if (profile) {
      // Sign out to prevent confusion
      await supabase.auth.signOut();
      
      return NextResponse.redirect(
        `${origin}/register?error=account_exists&message=${encodeURIComponent(
          "Akun Google ini sudah terdaftar. Silakan login."
        )}`
      );
    }

    // New user - CREATE profile NOW but with registered_at = NULL
    // This allows CV creation during onboarding (FK satisfied)
    // registered_at will be set when onboarding completes
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    const { error: insertError } = await adminClient.from("profiles").insert({
      user_id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
      registered_at: null, // ⭐ NULL = onboarding incomplete
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Profile creation error:", insertError);
      await supabase.auth.signOut();
      
      return NextResponse.redirect(
        `${origin}/register?error=profile_creation_failed&message=${encodeURIComponent(
          "Gagal membuat profil. Silakan coba lagi."
        )}`
      );
    }

    // Profile created with registered_at = NULL, redirect to onboarding
    return NextResponse.redirect(`${origin}/onboarding/verifikasi`);
  }

  // Fallback - shouldn't reach here
  return NextResponse.redirect(`${origin}/login`);
}
