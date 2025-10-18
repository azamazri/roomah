import { Metadata } from "next";
import { CvTabs } from "@/features/cv/components/cv-tabs";

export const metadata: Metadata = {
  title: "CV Saya - Roomah",
  description: "Kelola profil dan CV Anda untuk proses Taaruf",
  robots: "noindex",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">CV Saya</h1>
        <p className="text-muted-foreground">
          Kelola profil dan CV Anda untuk proses Taaruf
        </p>
      </div>

      <CvTabs />
    </div>
  );
}

