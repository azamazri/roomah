"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, GraduationCap, Briefcase, Heart } from "lucide-react";
import { CandidateSummary } from "../types";
import { CandidateModal } from "./candidate-modal";
import { ajukanTaaruf } from "@/features/taaruf/server/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CandidateCardProps {
  candidate: CandidateSummary;
  showTaaruofButton?: boolean;
}

export function CandidateCard({
  candidate,
  showTaaruofButton = false,
}: CandidateCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAjukanTaaruf = async () => {
    setIsSubmitting(true);
    try {
      const result = await ajukanTaaruf(candidate.id);

      if (result.success) {
        toast.success("Pengajuan Ta'aruf berhasil dikirim!");
        router.refresh();
      } else {
        switch (result.error) {
          case "CV_NOT_APPROVED":
            toast.error(
              "CV belum di-approve. Lengkapi CV Anda terlebih dahulu."
            );
            router.push("/cv-saya?tab=edit");
            break;
          case "INSUFFICIENT_COINS":
            toast.error(
              "Koin tidak mencukupi. Silakan top-up terlebih dahulu."
            );
            router.push("/koin");
            break;
          case "ACTIVE_TAARUF_EXISTS":
            toast.error("Anda sedang dalam proses Ta'aruf aktif.");
            break;
          default:
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="aspect-square bg-muted flex items-center justify-center">
            {candidate.avatar ? (
              <img
                src={candidate.avatar}
                alt={candidate.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-muted-foreground" />
            )}
          </div>

          <Badge
            className="absolute top-2 right-2"
            variant={
              candidate.status === "Siap Bertaaruf" ? "default" : "secondary"
            }
          >
            {candidate.status}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-card-foreground">
              {candidate.kodeKandidat}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {candidate.nama}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{candidate.pekerjaan}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{candidate.umur} tahun</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{candidate.domisili}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{candidate.pendidikan}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-input">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Kriteria:</strong> {candidate.kriteriaSingkat}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="flex-1"
              >
                Lihat Profile
              </Button>

              {showTaaruofButton && (
                <Button
                  size="sm"
                  onClick={handleAjukanTaaruf}
                  disabled={
                    isSubmitting || candidate.status !== "Siap Bertaaruf"
                  }
                  className="flex-1 gap-1"
                >
                  {isSubmitting ? "Mengirim..." : "Ajukan Ta'aruf"}
                </Button>
              )}
            </div>
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
