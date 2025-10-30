// app/admin/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Admin Layout with proper authentication and authorization
 * - Checks if user is authenticated
 * - Verifies user has admin privileges (is_admin = true)
 * - Redirects non-admin users to login page
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await supabaseServer();
  
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  // Verify admin status from profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin, full_name, email")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    console.error("Profile fetch error in admin layout:", error);
    redirect("/admin/login?error=profile_not_found");
  }

  // Check if user is admin
  if (!profile.is_admin) {
    console.error("Non-admin user attempted to access admin panel:", user.email);
    // Sign out non-admin users
    await supabase.auth.signOut();
    redirect("/admin/login?error=access_denied");
  }

  // Build admin user object with all permissions
  const adminUser = {
    id: user.id,
    email: profile.email || user.email || "",
    name: profile.full_name || "Admin",
    role: "admin" as const,
    isAdmin: true, // Required by AdminShell component
    scopes: [
      "dashboard",
      "cv_verification",
      "account_management",
      "taaruf_management",
      "finance",
      "posting_management",
      "settings",
    ],
  };

  return <AdminShell user={adminUser}>{children}</AdminShell>;
}
