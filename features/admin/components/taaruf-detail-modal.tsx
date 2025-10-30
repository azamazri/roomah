"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Heart, User, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TaarufDetailModalProps {
  open: boolean;
  onClose: () => void;
  taaruf: {
    id: string | number;
    taaruf_code: string;
    user_a: string;
    user_b: string;
    status: string;
    started_at: string;
    ended_at?: string;
    stage?: string; // From Kanban board for display purposes
    requester?: {
      full_name: string;
      gender?: string;
      cv_data?: {
        candidate_code?: string;
        education?: string;
        occupation?: string;
        province?: string;
      };
    };
    target?: {
      full_name: string;
      gender?: string;
      cv_data?: {
        candidate_code?: string;
        education?: string;
        occupation?: string;
        province?: string;
      };
    };
  } | null;
}

export function TaarufDetailModal({ open, onClose, taaruf }: TaarufDetailModalProps) {
  if (!taaruf) return null;

  const statusColors: Record<string, string> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "destructive",
    EXPIRED: "secondary",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Menunggu Persetujuan",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
    EXPIRED: "Kadaluarsa",
  };

  const stageLabels: Record<string, string> = {
    Pengajuan: "Pengajuan",
    Screening: "Screening",
    "Zoom 1": "Pertemuan Virtual Pertama",
    "Zoom 2": "Pertemuan Virtual Kedua",
    Keputusan: "Menunggu Keputusan",
    Selesai: "Selesai",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="px-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-5 w-5 text-primary" />
            Detail Proses Ta'aruf
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 px-2">
          {/* Status & Stage */}
          <div className="flex items-center justify-between p-5 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status Pengajuan</div>
              <Badge variant={statusColors[taaruf.status] as any} className="text-sm">
                {statusLabels[taaruf.status] || taaruf.status}
              </Badge>
            </div>
            {taaruf.stage && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tahap Proses</div>
                <Badge variant="default" className="text-sm">
                  {stageLabels[taaruf.stage] || taaruf.stage}
                </Badge>
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Requester (Pengaju) */}
            <div className="border rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">Pengaju</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {taaruf.requester?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{taaruf.requester?.full_name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">
                    {taaruf.requester?.cv_data?.candidate_code || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.requester?.cv_data?.education || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.requester?.cv_data?.occupation || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.requester?.cv_data?.province || "-"}</span>
                </div>
              </div>
            </div>

            {/* Target (Yang Dilamar) */}
            <div className="border rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b">
                <Heart className="h-4 w-4 text-primary" />
                <span className="font-semibold">Yang Dilamar</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {taaruf.target?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{taaruf.target?.full_name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">
                    {taaruf.target?.cv_data?.candidate_code || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.target?.cv_data?.education || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.target?.cv_data?.occupation || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{taaruf.target?.cv_data?.province || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border rounded-lg p-5 space-y-4">
            <div className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </div>

            <div className="space-y-3 text-sm">
              {taaruf.started_at && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Waktu Mulai Taaruf</span>
                  <span className="font-medium">
                    {format(new Date(taaruf.started_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                  </span>
                </div>
              )}

              {taaruf.taaruf_code && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Kode Taaruf</span>
                  <span className="font-medium font-mono">
                    {taaruf.taaruf_code}
                  </span>
                </div>
              )}

              {taaruf.ended_at && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Waktu Selesai</span>
                  <span className="font-medium">
                    {format(new Date(taaruf.ended_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-2">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
