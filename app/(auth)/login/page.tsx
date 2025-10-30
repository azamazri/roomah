// app/(auth)/login/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormLogin } from "@/features/auth/components/auth-form-login";
import { supabaseServer } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Login - Roomah",
  description: "Masuk ke Roomah",
  robots: "noindex, nofollow",
};

function safeNext(raw?: string | string[]) {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return val && val.startsWith("/") ? val : "/cari-jodoh";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect(safeNext(params.next));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <AuthCard
          title="Selamat Datang di Roomah"
          subtitle="Masuk untuk melanjutkan"
        >
          <AuthFormLogin />
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-link hover:underline font-medium"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
