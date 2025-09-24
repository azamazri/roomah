"use client";

import { useEffect, useRef } from "react";

interface NegativeGateModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
  negativeCount: number;
}

export function NegativeGateModal({
  isOpen,
  onContinue,
  onCancel,
  negativeCount,
}: NegativeGateModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus trap - focus the cancel button when modal opens
      cancelButtonRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative bg-card border border-input rounded-lg p-6 m-4 max-w-md w-full elevated"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 mb-4">
            <span className="text-warning text-xl">⚠️</span>
          </div>

          <h3
            id="modal-title"
            className="text-lg font-semibold text-card-foreground mb-2"
          >
            Konfirmasi Lanjutan
          </h3>

          <p className="text-sm text-muted-foreground mb-6">
            Kami melihat ada {negativeCount} jawaban "Tidak" dalam verifikasi
            kesiapan Anda. Apakah Anda bersedia melanjutkan ke step selanjutnya
            dengan dibimbing oleh Roomah?
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="flex-1 bg-muted text-muted-foreground border border-input rounded-md px-4 py-2 font-medium hover:bg-muted/80 focus-visible:ring-ring"
          >
            Tidak
          </button>
          <button
            onClick={onContinue}
            className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:bg-primary/90 focus-visible:ring-ring"
          >
            Ya, lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
