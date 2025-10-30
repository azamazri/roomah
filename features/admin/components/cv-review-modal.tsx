"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Ruler,
  Weight,
  FileText,
  Users,
  Heart,
  Target,
  Church,
  ChevronDown,
} from "lucide-react";
import { loadCvDataByUserId } from "@/server/actions/cv-details";
import { CvData } from "@/features/cv/types";
import { toast } from "sonner";

interface CvReviewModalProps {
  userId: string | null;
  onComplete: () => void;
  onClose: () => void;
}

export function CvReviewModal({
  userId,
  onComplete,
  onClose,
}: CvReviewModalProps) {
  const [decision, setDecision] = useState<"approve" | "revisi" | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(["biodata"]);

  useEffect(() => {
    if (userId) {
      loadCV();
    }
  }, [userId]);

  const loadCV = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await loadCvDataByUserId(userId);
      setCvData(data);
    } catch (error) {
      console.error("Error loading CV:", error);
      toast.error("Gagal memuat data CV");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleDecision = (newDecision: "approve" | "revisi") => {
    setDecision(newDecision);
    if (newDecision === "approve") {
      setConfirmDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !decision) return;
    if (decision === "revisi" && !note.trim()) {
      toast.error("Catatan wajib diisi untuk keputusan revisi");
      return;
    }
    setIsSubmitting(true);
    try {
      if (decision === "approve") {
        const res = await fetch(`/api/admin/cv-queue/${userId}/approve`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Approve failed");
        }
        toast.success(
          "CV berhasil disetujui. Pengguna mendapat kode kandidat."
        );
      } else {
        const res = await fetch(`/api/admin/cv-queue/${userId}/revise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Revise failed");
        }
        toast.success(
          "CV dikembalikan untuk revisi. Pengguna akan menerima catatan."
        );
      }
      onComplete();
    } catch (error: any) {
      toast.error(error?.message || "Gagal memproses CV. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  if (!userId) return null;

  const SectionCard = ({
    title,
    icon: IconComponent,
    sectionKey,
    children,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isOpen = openSections.includes(sectionKey);
    
    // Safety check
    if (!IconComponent) {
      console.error(`Icon undefined for section: ${sectionKey}`);
      return null;
    }
    
    return (
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-left">{title}</h3>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && <div className="px-6 py-4 space-y-2">{children}</div>}
      </Card>
    );
  };

  const DataRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between gap-4 py-3 px-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            Review CV Pengguna
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ) : cvData ? (
          <div className="space-y-4 px-2">
            {/* Header Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Nama Lengkap
                  </label>
                  <div className="text-lg font-semibold mt-1">
                    {cvData.biodata?.namaLengkap || "-"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Kode Kandidat
                  </label>
                  <div className="mt-1">
                    <Badge variant="default" className="text-sm">
                      {cvData.kodeKandidat || "Belum ada"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Biodata Section */}
            <SectionCard title="Biodata" icon={User} sectionKey="biodata">
              <div className="grid grid-cols-2 gap-4">
                <DataRow
                  label="Tanggal Lahir"
                  value={cvData.biodata?.tanggalLahir}
                />
                <DataRow
                  label="Jenis Kelamin"
                  value={
                    cvData.biodata?.jenisKelamin === "IKHWAN"
                      ? "Ikhwan"
                      : "Akhwat"
                  }
                />
                <DataRow
                  label="Status Pernikahan"
                  value={cvData.biodata?.statusPernikahan}
                />
                <DataRow label="Domisili" value={cvData.biodata?.domisili} />
                <DataRow
                  label="Pendidikan"
                  value={cvData.biodata?.pendidikan}
                />
                <DataRow label="Pekerjaan" value={cvData.biodata?.pekerjaan} />
                <DataRow
                  label="Penghasilan"
                  value={cvData.biodata?.penghasilan}
                />
                <DataRow
                  label="Tinggi / Berat"
                  value={`${cvData.biodata?.tinggiBadan || "-"} cm / ${
                    cvData.biodata?.beratBadan || "-"
                  } kg`}
                />
              </div>
            </SectionCard>

            {/* Kondisi Fisik */}
            <SectionCard title="Kondisi Fisik" icon={Ruler} sectionKey="fisik">
              <DataRow
                label="Tinggi / Berat"
                value={`${cvData.biodata?.tinggiBadan || "-"} cm / ${cvData.biodata?.beratBadan || "-"} kg`}
              />
              <DataRow
                label="Ciri Fisik"
                value={cvData.biodata?.ciriFisik}
              />
              {cvData.biodata?.riwayatPenyakit?.length > 0 && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Riwayat Penyakit:</span>
                  <div className="mt-1 space-y-1">
                    {cvData.biodata.riwayatPenyakit.map((penyakit: string, index: number) => (
                      <div key={index} className="text-sm">• {penyakit}</div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Latar Belakang Keluarga */}
            <SectionCard
              title="Latar Belakang Keluarga"
              icon={Users}
              sectionKey="keluarga"
            >
              <DataRow
                label="Keberadaan Orang Tua"
                value={cvData.biodata?.keberadaanOrangTua}
              />
              <DataRow
                label="Pekerjaan Orang Tua"
                value={cvData.biodata?.pekerjaanOrangTua}
              />
              <DataRow
                label="Anak Ke / Saudara"
                value={`${cvData.biodata?.anakKe || "-"} / ${cvData.biodata?.saudaraKandung || "-"}`}
              />
            </SectionCard>

            {/* Kondisi Ibadah */}
            <SectionCard
              title="Kondisi Ibadah"
              icon={Church}
              sectionKey="ibadah"
            >
              <DataRow
                label="Shalat Fardu"
                value={cvData.kondisiIbadah?.shalatFardu}
              />
              <DataRow
                label="Bacaan Quran"
                value={cvData.kondisiIbadah?.bacaanQuran}
              />
              <DataRow
                label="Puasa"
                value={cvData.kondisiIbadah?.puasa}
              />
              <DataRow
                label="Kajian"
                value={cvData.kondisiIbadah?.kajian}
              />
            </SectionCard>

            {/* Kriteria Pasangan */}
            <SectionCard
              title="Kriteria Pasangan"
              icon={Target}
              sectionKey="kriteria"
            >
              <DataRow
                label="Usia"
                value={cvData.kriteriaPasangan?.usia}
              />
              <DataRow
                label="Pendidikan"
                value={cvData.kriteriaPasangan?.pendidikan}
              />
              <DataRow
                label="Penghasilan"
                value={cvData.kriteriaPasangan?.penghasilan}
              />
              {cvData.kriteriaPasangan?.kriteriaKhusus?.length > 0 && (
                <div className="py-2">
                  <span className="text-sm text-muted-foreground">Kriteria Lainnya:</span>
                  <div className="mt-1 space-y-1">
                    {cvData.kriteriaPasangan.kriteriaKhusus.map((kriteria: string, index: number) => (
                      <div key={index} className="text-sm">• {kriteria}</div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Rencana Pernikahan */}
            <SectionCard
              title="Rencana Pernikahan"
              icon={Heart}
              sectionKey="rencana"
            >
              <DataRow
                label="Tahun Nikah"
                value={cvData.rencanaPernikahan?.tahunNikah}
              />
              <DataRow
                label="Tempat Tinggal"
                value={cvData.rencanaPernikahan?.tempatTinggal}
              />
              <DataRow
                label="Visi"
                value={cvData.rencanaPernikahan?.visi}
              />
              <DataRow
                label="Misi"
                value={cvData.rencanaPernikahan?.misi}
              />
            </SectionCard>

            {/* Decision Section */}
            <Card className="p-4 bg-muted/30">
              <label className="text-sm font-semibold block mb-3">
                Keputusan Review
              </label>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDecision("approve")}
                  className="flex-1 gap-2 bg-green-600 hover:!bg-green-700 text-white border border-green-600 hover:border-green-700"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  Setujui
                </Button>
                <Button
                  onClick={() => handleDecision("revisi")}
                  className="flex-1 gap-2 bg-red-600 hover:!bg-red-700 text-white border border-red-600 hover:border-red-700"
                  size="lg"
                >
                  <XCircle className="h-5 w-5" />
                  Minta Revisi
                </Button>
              </div>

              {decision === "revisi" && (
                <div className="mt-4">
                  <label className="text-sm font-medium">
                    Catatan Perbaikan <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Jelaskan bagian yang perlu diperbaiki..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Data CV tidak ditemukan</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          {decision === "revisi" && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !note.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Memproses..." : "Kirim Revisi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog for Approve */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Konfirmasi Persetujuan
            </AlertDialogTitle>
            <AlertDialogDescription>
              CV akan disetujui dan pengguna akan mendapat kode kandidat. Profil
              mereka akan tampil di halaman "Cari Jodoh". Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Memproses..." : "Ya, Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
