"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/server/db/client";

/**
 * Enforce onboarding completion
 * Redirects to onboarding if not completed
 */
export async function enforceOnboarding() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Check if profile exists and has registered_at
  const { data: profile } = await supabase
    .from("profiles")
    .select("registered_at")
    .eq("user_id", user.id)
    .single();

  // If no profile or not registered, redirect to onboarding
  if (!profile || !profile.registered_at) {
    redirect("/onboarding");
  }

  return { user, profile };
}

/**
 * Enforce CV approval for features that require it
 */
export async function enforceCVApproval() {
  const { user } = await enforceOnboarding();
  const supabase = await createClient();

  const { data: cv } = await supabase
    .from("cv_data")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!cv || cv.status !== "APPROVED") {
    redirect("/cv-saya?message=cv-not-approved");
  }

  return { user, cv };
}

/**
 * Require authentication only (no onboarding check)
 */
export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { user };
}
