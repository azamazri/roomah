"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X, Calendar } from "lucide-react";
import { InboundItem } from "../types";
import { CandidateModal } from "@/components/common/candidate-modal";
import { CandidateSummary } from "@/features/candidates/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function InboundList() {
  const [inboundItems, setInboundItems] = useState<InboundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateSummary | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [itemToReject, setItemToReject] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInboundItems();
  }, []);

  async function fetchInboundItems() {
    try {
      const res = await fetch("/api/taaruf/inbound", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat inbox");
      setInboundItems(json.items ?? []);
    } catch (error) {
      console.error("Error fetching inbound items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewCV(candidateId: string) {
    try {
      // TODO: ganti endpoint ini sesuai endpoint kandidat milikmu
      const res = await fetch(`/api/candidates/${candidateId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat kandidat");
      setSelectedCandidate(json as CandidateSummary);
      setShowCandidateModal(true);
    } catch (error) {
      toast.error("Gagal memuat detail kandidat");
    }
  }

  async function handleAccept(itemId: string) {
    setProcessingId(itemId);
    try {
      const res = await fetch("/api/taaruf/inbound/accept", {
        method: "POST",
        body: JSON.stringify({ id: itemId }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menerima pengajuan");
      }
      toast.success("Pengajuan Taaruf diterima!");
      fetchInboundItems();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectConfirm() {
    if (!itemToReject) return;

    setProcessingId(itemToReject);
    try {
      const res = await fetch("/api/taaruf/inbound/reject", {
        method: "POST",
        body: JSON.stringify({ id: itemToReject }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menolak pengajuan");
      }
      toast.success("Pengajuan Taaruf ditolak");
      fetchInboundItems();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
      setShowRejectDialog(false);
      setItemToReject(null);
    }
  }

  function handleReject(itemId: string) {
    setItemToReject(itemId);
    setShowRejectDialog(true);
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border border-input rounded-md"
            >
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (inboundItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum Ada CV Masuk</h3>
          <p>Belum ada yang mengajukan Taaruf kepada Anda</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="divide-y divide-border">
        {inboundItems.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {item.kodeKandidat}
                  </Badge>
                  <Badge
                    variant={
                      item.status === "pending" ? "secondary" : "default"
                    }
                  >
                    {item.status === "pending" ? "Menunggu" : item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(item.waktuPengajuan)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCV(item.candidateId)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Lihat CV
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAccept(item.id)}
                  disabled={processingId === item.id}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {processingId === item.id ? "Memproses..." : "Terima"}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(item.id)}
                  disabled={processingId === item.id}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Tolak
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          open={showCandidateModal}
          onClose={() => {
            setShowCandidateModal(false);
            setSelectedCandidate(null);
          }}
        />
      )}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin akan menolak tawaran Taaruf ini? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

