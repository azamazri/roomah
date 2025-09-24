"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingFlag } from "@/features/auth/lib/mock-session";

export function OnboardingSummary() {
  const [flags, setFlags] = useState({ fiveQ: "", cv: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current onboarding status
    const fiveQ = getOnboardingFlag("rmh_5q");
    const cv = getOnboardingFlag("rmh_cv");
    setFlags({ fiveQ, cv });
  }, []);

  async function handleComplete() {
    setIsLoading(true);

    // Simulate final processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push("/cari-jodoh");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-card-foreground">
          Ringkasan Pendaftaran:
        </h3>

        <div className="space-y-3">
          {/* 5Q Status */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                flags.fiveQ === "1"
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {flags.fiveQ === "1" ? "✓" : "✗"}
            </div>
            <div>
              <p className="font-medium text-card-foreground">Verifikasi 5Q</p>
              <p className="text-sm text-muted-foreground">
                {flags.fiveQ === "1"
                  ? "Terisi & Komitmen"
                  : "Belum terisi atau tidak memenuhi syarat"}
              </p>
            </div>
          </div>

          {/* CV Status */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                flags.cv === "1"
                  ? "bg-success text-success-foreground"
                  : flags.cv === "0"
                  ? "bg-warning text-warning-foreground"
                  : "bg-muted-foreground text-background"
              }`}
            >
              {flags.cv === "1" ? "✓" : flags.cv === "0" ? "⚠" : "-"}
            </div>
            <div>
              <p className="font-medium text-card-foreground">CV Biodata</p>
              <p className="text-sm text-muted-foreground">
                {flags.cv === "1"
                  ? "CV Utama berhasil diisi. Rekomendasi: lengkapi detail CV di halaman CV Saya."
                  : flags.cv === "0"
                  ? "Anda belum mengisi CV Utama. Silakan isi di halaman CV Saya."
                  : "Status tidak diketahui"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {flags.cv === "0" && (
        <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
          <h4 className="font-medium text-info-foreground mb-2">
            💡 Rekomendasi
          </h4>
          <p className="text-sm text-info-foreground">
            Untuk meningkatkan peluang mendapatkan pasangan yang sesuai,
            lengkapi biodata diri Anda di halaman CV Saya setelah menyelesaikan
            pendaftaran.
          </p>
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground rounded-md px-6 py-3 font-medium hover:bg-primary/90 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? "Menyelesaikan..." : "Selesai"}
      </button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Setelah klik "Selesai", Anda akan diarahkan ke halaman utama dan dapat
          mulai mencari pasangan yang tepat.
        </p>
      </div>
    </div>
  );
}
