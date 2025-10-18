// app/admin/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { supabaseServer } from "@/lib/supabase/server";

// Stabil dulu: anggap siapa pun yang bisa login ke /admin adalah admin.
// Nanti bisa diganti cek role dari tabel khusus (profiles/admin_roles).
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?next=/admin/dashboard");
  }

  // minimal user object utk AdminShell (RBAC bisa diisi belakangan)
  const adminUser = {
    id: user.id,
    email: user.email ?? "",
    role: "admin" as const,
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
