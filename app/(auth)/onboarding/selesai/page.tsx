import { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { OnboardingSummary } from "@/features/auth/components/onboarding-summary";

export const metadata: Metadata = {
  title: "Pendaftaran Selesai - Roomah",
  description: "Selamat! Pendaftaran Anda telah berhasil diselesaikan",
  robots: "noindex, nofollow",
};

export default function SelesaiPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <AuthCard
          title="🎉 Selamat!"
          subtitle="Anda berhasil menyelesaikan pendaftaran akun Roomah"
        >
          <OnboardingSummary />
        </AuthCard>
      </div>
    </div>
  );
}
