import { createClient } from "@/server/db/client";
import { redirect } from "next/navigation";

/**
 * Check if current user is an admin
 * Redirects to home if not authenticated or not admin
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    redirect("/");
  }

  return { user, profile };
}

/**
 * Check if current user is authenticated
 * Redirects to login if not
 */
export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  return { user };
}
