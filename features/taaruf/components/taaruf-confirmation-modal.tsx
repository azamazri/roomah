"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaarufConfirmationModalProps {
  open: boolean;
  type: "accept" | "reject" | null;
  candidateCode: string;
  onConfirm: (rejectReason?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaarufConfirmationModal({
  open,
  type,
  candidateCode,
  onConfirm,
  onCancel,
  isLoading = false,
}: TaarufConfirmationModalProps) {
  const [rejectReason, setRejectReason] = useState("");

  const handleConfirm = () => {
    if (type === "reject") {
      onConfirm(rejectReason);
    } else {
      onConfirm();
    }
    setRejectReason(""); // Reset after confirm
  };

  const handleCancel = () => {
    setRejectReason(""); // Reset on cancel
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "accept"
              ? "Konfirmasi Terima Pengajuan Taaruf"
              : "Konfirmasi Tolak Pengajuan Taaruf"}
          </AlertDialogTitle>
          <div className="space-y-4">
            {type === "accept" ? (
              <div className="space-y-2">
                <AlertDialogDescription>
                  Apakah Anda yakin ingin <strong>menerima</strong> pengajuan taaruf dari{" "}
                  <strong>{candidateCode}</strong>?
                </AlertDialogDescription>
                <p className="text-sm text-muted-foreground">
                  Dengan menerima pengajuan ini, proses taaruf akan dimulai dan Anda akan
                  mendapatkan kode taaruf untuk komunikasi lebih lanjut.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AlertDialogDescription>
                  Apakah Anda yakin ingin <strong>menolak</strong> pengajuan taaruf dari{" "}
                  <strong>{candidateCode}</strong>?
                </AlertDialogDescription>
                <div className="space-y-2">
                  <Label htmlFor="rejectReason" className="text-sm">
                    Alasan Penolakan (Opsional)
                  </Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Tuliskan alasan penolakan..."
                    className="min-h-[100px]"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alasan ini akan membantu kandidat memahami keputusan Anda
                  </p>
                </div>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              type === "reject"
                ? "bg-destructive hover:bg-destructive/90"
                : undefined
            }
          >
            {isLoading
              ? "Memproses..."
              : type === "accept"
              ? "Ya, Terima"
              : "Ya, Tolak"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
