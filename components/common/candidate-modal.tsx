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
  tinggiBadan: number | null;
  beratBadan: number | null;
  riwayatPenyakit?: string[] | null; // <- optional & nullable
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
    } as const;
    return (map)[penghasilan] ?? penghasilan ?? "-";
  };

  // ==== SAFETY GUARDS (tanpa mengubah UI) ====
  const avatar = candidate.avatar || null;
  const tinggi =
    typeof candidate.tinggiBadan === "number" ? candidate.tinggiBadan : 0;
  const berat =
    typeof candidate.beratBadan === "number" ? candidate.beratBadan : 0;

  // riwayatPenyakit bisa undefined/null/string => pastikan array string[]
  const riwayatPenyakit: string[] = Array.isArray(candidate.riwayatPenyakit)
    ? candidate.riwayatPenyakit.filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Detail Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-primary/10">
              {avatar ? (
                <img
                  src={avatar}
                  alt={candidate.nama}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {candidate.kodeKandidat || candidate.nama || "Kandidat"}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {candidate.nama || "-"}
                  </p>
                </div>
                <Badge
                  variant={
                    candidate.status === "Siap Bertaaruf" ? "default" : "secondary"
                  }
                  className="text-sm px-3 py-1"
                >
                  {candidate.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{candidate.umur || 0} tahun</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.domisili || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Information - Grid Layout */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Informasi Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Tanggal Lahir</span>
                  <span className="text-sm font-semibold text-foreground">{candidate.tanggalLahir || "-"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Status Pernikahan</span>
                  <span className="text-sm font-semibold text-foreground">{candidate.statusPernikahan || "-"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Domisili</span>
                  <span className="text-sm font-semibold text-foreground">{candidate.domisili || "-"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Pendidikan</span>
                  <span className="text-sm font-semibold text-foreground">{candidate.pendidikan || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional & Financial Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Informasi Profesional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Pekerjaan</span>
                  <span className="text-sm font-semibold text-foreground">{candidate.pekerjaan || "-"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Penghasilan</span>
                  <span className="text-sm font-semibold text-foreground">{formatPenghasilan(candidate.penghasilan)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Informasi Fisik</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Ruler className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Tinggi Badan</span>
                  <span className="text-sm font-semibold text-foreground">{tinggi > 0 ? `${tinggi} cm` : "-"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Weight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Berat Badan</span>
                  <span className="text-sm font-semibold text-foreground">{berat > 0 ? `${berat} kg` : "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Info */}
          {riwayatPenyakit.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">Riwayat Kesehatan</h4>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-muted-foreground block mb-2">Riwayat Penyakit</span>
                  <div className="space-y-1">
                    {riwayatPenyakit.map((penyakit, index) => (
                      <div key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{penyakit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

