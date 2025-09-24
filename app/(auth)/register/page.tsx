import { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormRegister } from "@/features/auth/components/auth-form-register";

export const metadata: Metadata = {
  title: "Daftar - Roomah",
  description:
    "Bergabunglah dengan Roomah untuk memulai perjalanan Ta&apos;aruf yang bermakna",
  robots: "noindex, nofollow",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Selamat Datang di Roomah"
          subtitle="Mulai perjalanan Ta'aruf yang bermakna"
        >
          <AuthFormRegister />
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
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
