import { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { FiveQForm } from "@/features/auth/components/fiveq-form";

export const metadata: Metadata = {
  title: "Verifikasi Kesiapan - Roomah",
  description: "Verifikasi kesiapan Anda untuk memulai Ta'aruf",
  robots: "noindex, nofollow",
};

export default function VerifikasiPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <AuthCard
          title="Verifikasi Kesiapan Taaruf"
          subtitle="Jawab 5 pertanyaan berikut dengan jujur untuk memastikan kesiapan Anda"
        >
          <FiveQForm />
        </AuthCard>
      </div>
    </div>
  );
}
