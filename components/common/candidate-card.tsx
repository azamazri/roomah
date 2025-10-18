"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, GraduationCap, Briefcase, Coins } from "lucide-react";
import { CandidateModal } from "./candidate-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CandidateSummary {
  id: string;
  kodeKandidat: string;
  avatar: string | null;
  nama: string;
  umur: number;
  pekerjaan: string;
  domisili: string;
  pendidikan: string;
  kriteriaSingkat: string;
  status: "Siap Bertaaruf" | "Dalam Proses" | "Khitbah";
  tanggalLahir: string;
  statusPernikahan: "Single" | "Janda" | "Duda";
  penghasilan: "0-2" | "2-5" | "5-10" | "10+" | "Saat Taaruf";
  tinggiBadan: number;
  beratBadan: number;
  riwayatPenyakit: string[];
  gender: "M" | "F";
}

interface CandidateCardProps {
  candidate: CandidateSummary;
  showTaarufButton?: boolean;
}

export function CandidateCard({
  candidate,
  showTaarufButton = false,
}: CandidateCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAjukanTaaruf = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/taaruf/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || "Pengajuan Taaruf berhasil dikirim!");
        router.refresh();
      } else {
        const message = json.error || "Terjadi kesalahan";
        
        if (message.includes("CV") || message.includes("approve")) {
          toast.error("CV belum di-approve. Lengkapi CV Anda terlebih dahulu.");
          router.push("/cv-saya?tab=edit");
        } else if (message.includes("saldo") || message.includes("koin")) {
          toast.error("Koin tidak mencukupi. Silakan top-up terlebih dahulu.");
          router.push("/koin-saya");
        } else if (message.includes("Taaruf aktif") || message.includes("menunggu")) {
          toast.error("Anda sedang dalam proses Taaruf aktif atau menunggu.");
        } else {
          toast.error(message);
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow transition-shadow">
        <div className="p-6 space-y-4">
          {/* Avatar and Badge in same row */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Badge
                variant={
                  candidate.status === "Siap Bertaaruf" ? "default" : "secondary"
                }
                className="mb-1"
              >
                {candidate.status}
              </Badge>
            </div>
          </div>

          {/* Candidate Code & Job */}
          <div>
            <h3 className="font-semibold text-xl text-card-foreground">
              {candidate.kodeKandidat || candidate.nama || "Kandidat"}
            </h3>
            <p className="text-base text-muted-foreground font-medium">
              {candidate.pekerjaan || "-"}
            </p>
          </div>

          {/* Info in single row with icons */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{candidate.umur || 0} tahun</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{candidate.domisili || "-"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>{candidate.pendidikan || "-"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowModal(true)}
              className="flex-1"
            >
              Lihat CV
            </Button>

            {showTaarufButton && (
              <Button
                size="default"
                onClick={handleAjukanTaaruf}
                disabled={
                  isSubmitting || candidate.status !== "Siap Bertaaruf"
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Coins className="h-4 w-4 mr-1.5" />
                <span className="font-semibold">5</span>
                <span className="ml-1.5">{isSubmitting ? "Mengirim..." : "Ajukan Taaruf"}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <CandidateModal
        candidate={candidate}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

