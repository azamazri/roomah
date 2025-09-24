"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Ruler,
  Weight,
  FileText,
} from "lucide-react";

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

interface CandidateModalProps {
  candidate: CandidateSummary;
  open: boolean;
  onClose: () => void;
}

export function CandidateModal({
  candidate,
  open,
  onClose,
}: CandidateModalProps) {
  const formatPenghasilan = (penghasilan: string) => {
    const map = {
      "0-2": "0-2 Juta",
      "2-5": "2-5 Juta",
      "5-10": "5-10 Juta",
      "10+": "10+ Juta",
      "Saat Taaruf": "Saat Taaruf",
    };
    return map[penghasilan as keyof typeof map] || penghasilan;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Profile</span>
            <Badge
              variant={
                candidate.status === "Siap Bertaaruf" ? "default" : "secondary"
              }
            >
              {candidate.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.nama}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg">{candidate.kodeKandidat}</h3>
            <p className="text-muted-foreground">{candidate.nama}</p>
          </div>

          {/* Detail Information */}
          <div className="space-y-3 pt-4 border-t border-input">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Tanggal Lahir:</span>
                <span className="ml-2">{candidate.tanggalLahir}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">{candidate.statusPernikahan}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Domisili:</span>
                <span className="ml-2">{candidate.domisili}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Pendidikan:</span>
                <span className="ml-2">{candidate.pendidikan}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Pekerjaan:</span>
                <span className="ml-2">{candidate.pekerjaan}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Penghasilan:</span>
                <span className="ml-2">
                  {formatPenghasilan(candidate.penghasilan)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Tinggi Badan:</span>
                <span className="ml-2">{candidate.tinggiBadan} cm</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Weight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">Berat Badan:</span>
                <span className="ml-2">{candidate.beratBadan} kg</span>
              </div>
            </div>

            {candidate.riwayatPenyakit.length > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Riwayat Penyakit:</span>
                  <div className="ml-2 mt-1">
                    {candidate.riwayatPenyakit.map((penyakit, index) => (
                      <div key={index} className="text-muted-foreground">
                        • {penyakit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
