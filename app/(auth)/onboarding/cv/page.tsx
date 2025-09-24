import { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { CvOnboardingForm } from "@/features/auth/components/cv-onboarding-form";

export const metadata: Metadata = {
  title: "Biodata Diri - Roomah",
  description: "Lengkapi biodata diri Anda untuk profil yang lebih menarik",
  robots: "noindex, nofollow",
};

export default function CvPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <AuthCard
          title="Biodata Diri"
          subtitle="Lengkapi informasi diri Anda (opsional, dapat dilewati)"
        >
          <CvOnboardingForm />
        </AuthCard>
      </div>
    </div>
  );
}
