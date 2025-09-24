import { redirect } from "next/navigation";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { checkAdminAccess } from "@/features/admin/server/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await checkAdminAccess();

  if (!user || !["admin", "finance", "moderator"].includes(user.role)) {
    redirect("/");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
