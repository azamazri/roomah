"use server";

import { createClient, createAdminClient } from "@/server/db/client";
import { redirect } from "next/navigation";

export interface SignInResult {
  success: boolean;
  error?: string;
  message?: string;
  status?: "signed_in" | "needs_verification";
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Sign up with email and password
 */
export async function signUp({
  email,
  password,
  fullName,
}: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<SignInResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "User",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
      message: error.message,
    };
  }

  // Check if email confirmation is required
  const needsVerification = data.user && !data.session;

  // If user is signed in (no email verification needed), create profile
  if (data.user && data.session) {
    // Use admin client to bypass RLS when creating initial profile
    const adminClient = createAdminClient();
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: data.user.id,
      email: email,
      full_name: fullName || "User",
      registered_at: null, // ⭐ NULL = onboarding incomplete
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return {
        success: false,
        error: "Gagal membuat profil. Silakan coba lagi.",
        message: "Gagal membuat profil. Silakan coba lagi.",
      };
    }

    return {
      success: true,
      status: "signed_in",
    };
  }

  // Email verification needed
  return {
    success: true,
    status: "needs_verification",
    message: "Silakan cek email Anda untuk verifikasi akun.",
  };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Start Google OAuth flow
 * @param flow - "login" or "register" to distinguish the flow
 */
export async function startGoogleOAuth(flow: "login" | "register" = "login") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?flow=${flow}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
      url: null,
    };
  }

  return {
    success: true,
    url: data.url,
    error: null,
  };
}
