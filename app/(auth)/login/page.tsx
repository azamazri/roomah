import { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormLogin } from "@/features/auth/components/auth-form-login";

export const metadata: Metadata = {
  title: "Masuk - Roomah",
  description:
    "Masuk ke akun Roomah Anda untuk melanjutkan Ta&apos;aruf yang bermakna",
  robots: "noindex, nofollow",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Selamat Datang Kembali"
          subtitle="Masuk ke akun Roomah Anda"
        >
          <AuthFormLogin />
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-link hover:underline font-medium"
              >
                Register dulu
              </Link>
            </p>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
