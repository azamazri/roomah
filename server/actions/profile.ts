"use server";

import { createClient } from "@/server/db/client";

/**
 * Ensure profile exists for current user
 * Create if missing (for users created before Option A implementation)
 */
export async function ensureProfileExists() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    // Profile already exists
    return {
      success: true,
      exists: true,
    };
  }

  // Create profile with registered_at = NULL
  const { error: insertError } = await supabase.from("profiles").insert({
    user_id: user.id,
    email: user.email!,
    full_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    registered_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Failed to create profile:", insertError);
    return {
      success: false,
      error: "Gagal membuat profil: " + insertError.message,
    };
  }

  return {
    success: true,
    exists: false,
    created: true,
  };
}
