// app/admin/login/page.tsx
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminLoginForm from "./ui";

async function loginAdmin(formData: FormData) {
  "use server";

  // DEV DEMO ONLY (terima input apa pun)
  const next = (formData.get("next") as string) || "/admin/dashboard";

  const isProd = process.env.NODE_ENV === "production";
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };

  // Set sesi admin
  const jar = cookies();
  jar.set("rmh_auth", "1", opts);
  jar.set("rmh_admin", "1", opts);

  // (Opsional) bersihkan flag onboarding user agar tidak ganggu area admin
  // jar.delete("rmh_5q");
  // jar.delete("rmh_cv");

  redirect(next);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next || "/admin/dashboard";

  return (
    <Suspense>
      {/* UI dipisah ke komponen client agar bisa pakai useState dll */}
      <AdminLoginForm action={loginAdmin} next={next} />
    </Suspense>
  );
}
