"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, GraduationCap, Briefcase, Coins } from "lucide-react";
import { CandidateModal } from "./candidate-modal";
import { useAjukanTaaruf } from "@/features/taaruf/hooks/use-taaruf";

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
  const { ajukan, isLoading } = useAjukanTaaruf();

  const handleAjukanTaaruf = async () => {
    await ajukan(candidate.id);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 h-full">
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col h-full">
          {/* Avatar and Badge */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary/10">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.kodeKandidat}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Badge
                variant={
                  candidate.status === "Siap Bertaaruf" ? "default" : "secondary"
                }
                className="text-xs sm:text-sm"
              >
                {candidate.status}
              </Badge>
            </div>
          </div>

          {/* Candidate Code & Job */}
          <div className="flex-1">
            <h3 className="font-bold text-lg sm:text-xl text-card-foreground mb-1 truncate">
              {candidate.kodeKandidat || candidate.nama || "Kandidat"}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium truncate">
              {candidate.pekerjaan || "-"}
            </p>
          </div>

          {/* Info Grid - Responsive stacking */}
          <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0 text-primary" />
              <span>{candidate.umur || 0} tahun</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{candidate.domisili || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{candidate.pendidikan || "-"}</span>
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowModal(true)}
              className="w-full sm:flex-1"
            >
              Lihat CV
            </Button>

            {showTaarufButton && (
              <Button
                variant="primary"
                size="md"
                onClick={handleAjukanTaaruf}
                disabled={
                  isLoading || candidate.status !== "Siap Bertaaruf"
                }
                className="w-full sm:flex-1 text-sm whitespace-nowrap"
              >
                <Coins className="h-4 w-4 mr-1" />
                <span className="font-semibold">5</span>
                <span className="ml-1">{isLoading ? "Mengirim..." : "Ajukan Taaruf"}</span>
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

