import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormRegister } from "@/features/auth/components/auth-form-register";
import { supabaseServer } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Daftar - Roomah",
  description: "Bergabunglah dengan Roomah…",
  robots: "noindex, nofollow",
};

export default async function RegisterPage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/onboarding/verifikasi");
  }

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
          subtitle="Mulai perjalanan Taaruf yang bermakna"
        >
          <AuthFormRegister />
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                prefetch={false}
                className="text-link hover:underline font-medium"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
