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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Heart,
  Users,
  Church,
  Target,
  Ring,
  ChevronDown,
} from "lucide-react";
import { loadCvDataByUserId } from "@/server/actions/cv-details";
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
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
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
        if (!res.ok) throw new Error("Approve failed");
        toast.success(
          "CV berhasil disetujui. Pengguna mendapat kode kandidat."
        );
      } else {
        const res = await fetch(`/api/admin/cv-queue/${userId}/revise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note.trim() }),
        });
        if (!res.ok) throw new Error("Revise failed");
        toast.success(
          "CV dikembalikan untuk revisi. Pengguna akan menerima catatan."
        );
      }
      onComplete();
    } catch {
      toast.error("Gagal memproses CV. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Review CV Pengguna
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ) : cvDetail ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nama Lengkap
                </label>
                <div className="text-sm mt-1">{cvDetail.namaLengkap}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Gender
                </label>
                <div className="text-sm mt-1 flex items-center gap-2">
                  {cvDetail.gender === "M" ? "Ikhwan" : "Akhwat"}
                  <Badge variant="default" className="text-xs">
                    {cvDetail.gender}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tanggal Lahir
                </label>
                <div className="text-sm mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(cvDetail.tanggalLahir).toLocaleDateString("id-ID")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Asal Daerah
                </label>
                <div className="text-sm mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {cvDetail.asalDaerah}
                </div>
              </div>
            </div>

            {/* Education & Work */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Pendidikan
                </label>
                <div className="text-sm mt-1">{cvDetail.pendidikan}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Pekerjaan
                </label>
                <div className="text-sm mt-1">{cvDetail.pekerjaan}</div>
              </div>
            </div>

            {/* Deskripsi Diri */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Deskripsi Diri
              </label>
              <div className="text-sm mt-1 p-3 bg-muted/30 rounded-md">
                {cvDetail.deskripsiDiri}
              </div>
            </div>

            {/* Decision Section */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium">Keputusan Review</label>
              <div className="flex gap-3 mt-2">
                <Button
                  variant={decision === "approve" ? "default" : "outline"}
                  onClick={() => handleDecision("approve")}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Setujui
                </Button>
                <Button
                  variant={decision === "revisi" ? "default" : "outline"}
                  onClick={() => handleDecision("revisi")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Minta Revisi
                </Button>
              </div>

              {decision === "revisi" && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Catatan Perbaikan *
                  </label>
                  <Textarea
                    placeholder="Jelaskan bagian yang perlu diperbaiki..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Data CV tidak ditemukan
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          {decision === "revisi" && (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!note.trim()}
            >
              Kirim Revisi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog for Approve */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
            <AlertDialogDescription>
              CV akan disetujui dan pengguna akan mendapat kode kandidat. Profil
              mereka akan tampil di halaman &quot;Cari Jodoh&quot;. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Ya, Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
