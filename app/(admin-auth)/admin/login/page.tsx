// app/(admin-auth)/admin/login/page.tsx
import "server-only";
import { Suspense } from "react";
import AdminLoginForm from "./ui";

export const dynamic = "force-static";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
  const next =
    nextRaw && (nextRaw === "/admin" || nextRaw?.startsWith("/admin/"))
      ? nextRaw
      : "/admin/dashboard";

  return (
    <Suspense>
      <AdminLoginForm next={next} />
    </Suspense>
  );
}
