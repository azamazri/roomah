"use server";

import { createClient } from "@/server/db/client";
import { redirect } from "next/navigation";

export interface FiveQData {
  q1: boolean;
  q2: boolean;
  q3: boolean;
  q4: boolean;
  q5: boolean;
  committed?: boolean;
}

/**
 * Save 5Q verification data
 */
export async function saveVerification(data: FiveQData) {
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

  // Check if all questions are answered positively
  const allPositive = data.q1 && data.q2 && data.q3 && data.q4 && data.q5;
  const hasNegative = !data.q1 || !data.q2 || !data.q3 || !data.q4 || !data.q5;

  // If has negative and not committed, block
  if (hasNegative && !data.committed) {
    return {
      success: false,
      error: "Commitment required for negative answers",
      requiresCommitment: true,
    };
  }

  // Save verification
  const { error } = await supabase.from("onboarding_verifications").upsert({
    user_id: user.id,
    q1: data.q1,
    q2: data.q2,
    q3: data.q3,
    q4: data.q4,
    q5: data.q5,
    committed: data.committed || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error saving verification:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  // DON'T set registered_at here - that happens at completeOnboarding
  // User still needs to fill CV before registration is complete

  return {
    success: true,
    allPositive,
  };
}

/**
 * Get user's verification status
 */
export async function getVerificationStatus() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data } = await supabase
    .from("onboarding_verifications")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}
