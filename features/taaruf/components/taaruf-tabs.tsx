"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Send, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Briefcase,
  Eye,
  Video,
  Link as LinkIcon
} from "lucide-react";
import { 
  useIncomingRequests, 
  useSentRequests, 
  useActiveTaaruf,
  useTaarufActions 
} from "../hooks/use-taaruf";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CvDetailModal } from "./cv-detail-modal";
import { TaarufConfirmationModal } from "./taaruf-confirmation-modal";
import { CountdownTimer } from "./countdown-timer";

export function TaarufTabs() {
  const { requests: incoming, isLoading: loadingIncoming, refresh: refreshIncoming } = useIncomingRequests();
  const { requests: sent, isLoading: loadingSent, refresh: refreshSent } = useSentRequests();
  const { sessions: active, isLoading: loadingActive, refresh: refreshActive } = useActiveTaaruf();
  const { acceptRequest, rejectRequest, isLoading: actionLoading } = useTaarufActions();

  // Modal states
  const [cvDetailOpen, setCvDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"accept" | "reject" | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedCandidateCode, setSelectedCandidateCode] = useState<string>("");

  const handleViewCV = (userId: string) => {
    setSelectedUserId(userId);
    setCvDetailOpen(true);
  };

  const handleAcceptClick = (requestId: string, candidateCode: string) => {
    setSelectedRequestId(requestId);
    setSelectedCandidateCode(candidateCode);
    setConfirmationType("accept");
    setConfirmationOpen(true);
  };

  const handleRejectClick = (requestId: string, candidateCode: string) => {
    setSelectedRequestId(requestId);
    setSelectedCandidateCode(candidateCode);
    setConfirmationType("reject");
    setConfirmationOpen(true);
  };

  const handleConfirmAction = async (rejectReason?: string) => {
    if (!selectedRequestId) return;

    if (confirmationType === "accept") {
      const result = await acceptRequest(selectedRequestId);
      if (result.success) {
        refreshIncoming();
        refreshActive();
      }
    } else if (confirmationType === "reject") {
      const result = await rejectRequest(selectedRequestId, rejectReason);
      if (result.success) {
        refreshIncoming();
      }
    }

    setConfirmationOpen(false);
    setSelectedRequestId(null);
    setConfirmationType(null);
  };

  const isRequestExpired = (expiresAt: string) => {
    return new Date(expiresAt).getTime() < new Date().getTime();
  };

  return (
    <Tabs defaultValue="masuk" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="masuk" className="gap-2">
          <Inbox className="h-4 w-4" />
          CV Masuk
          {incoming.length > 0 && (
            <Badge variant="default" className="ml-1">{incoming.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="dikirim" className="gap-2">
          <Send className="h-4 w-4" />
          CV Dikirim
        </TabsTrigger>
        <TabsTrigger value="aktif" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Taaruf Aktif
          {active.length > 0 && (
            <Badge variant="default" className="ml-1">{active.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* CV MASUK - Incoming Requests */}
      <TabsContent value="masuk" className="space-y-4 mt-6">
        {loadingIncoming ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Memuat...
            </CardContent>
          </Card>
        ) : incoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Belum ada pengajuan taaruf masuk</p>
            </CardContent>
          </Card>
        ) : (
          incoming.map((request: any) => {
            const expired = isRequestExpired(request.expires_at);
            const candidateCode = request.sender?.cv_data?.candidate_code || "Kandidat";
            
            return (
              <Card key={request.id} className="mx-0">
                <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Baris 1: Kode Kandidat */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{candidateCode}</h3>
                    {/* Desktop: Lihat CV Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCV(request.from_user)}
                      className="hidden sm:flex"
                    >
                      Lihat CV
                    </Button>
                  </div>

                  {/* Baris 2: Waktu Pengajuan */}
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {request.created_at ? format(new Date(request.created_at), "EEEE, dd MMMM yyyy HH:mm", { locale: idLocale }) : "-"}
                  </div>

                  {/* Baris 3: Countdown */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Waktu mundur 7 hari</span>
                  </div>

                  {/* Baris 4: Tombol Aksi - Stacked di Mobile, Inline di Desktop */}
                  {!expired && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptClick(request.id, candidateCode)}
                        disabled={actionLoading}
                        className="w-full sm:flex-1 gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Terima
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectClick(request.id, candidateCode)}
                        disabled={actionLoading}
                        className="w-full sm:flex-1 gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      {/* CV DIKIRIM - Sent Requests */}
      <TabsContent value="dikirim" className="space-y-4 mt-6">
        {loadingSent ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Memuat...
            </CardContent>
          </Card>
        ) : sent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Belum ada pengajuan taaruf yang dikirim</p>
            </CardContent>
          </Card>
        ) : (
          sent.map((request: any) => {
            const expired = isRequestExpired(request.expires_at);
            const candidateCode = request.receiver?.cv_data?.candidate_code || "Kandidat";
            const isPending = request.status === "PENDING";
            const isAccepted = request.status === "ACCEPTED";
            const isRejected = request.status === "REJECTED";
            
            return (
              <Card key={request.id} className="mx-0">
                <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Baris 1: Kode Kandidat & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">{candidateCode}</h3>
                    <Badge 
                      variant={
                        isAccepted ? "success" :
                        isRejected ? "destructive" :
                        isPending ? "warning" : "default"
                      }
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 shrink-0"
                    >
                      {isAccepted ? "Diterima" :
                       isRejected ? "Ditolak" :
                       expired ? "Expired" : "Menunggu"}
                    </Badge>
                  </div>

                  {/* Baris 2: Waktu Pengajuan */}
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {request.created_at ? format(new Date(request.created_at), "EEEE, dd MMMM yyyy HH:mm", { locale: idLocale }) : "-"}
                  </div>

                  {/* Baris 3: Countdown (hanya jika PENDING) */}
                  {isPending && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <CountdownTimer expiresAt={request.expires_at} />
                    </div>
                  )}

                  {/* Alasan Penolakan */}
                  {isRejected && request.reason_reject && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-xs sm:text-sm text-muted-foreground">Alasan Penolakan:</span>
                      <p className="text-xs sm:text-sm mt-1">{request.reason_reject}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      {/* TAARUF AKTIF - Active Sessions */}
      <TabsContent value="aktif" className="space-y-4 mt-6 px-2 sm:px-4">
        {loadingActive ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Memuat...
            </CardContent>
          </Card>
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Tidak ada taaruf aktif saat ini</p>
            </CardContent>
          </Card>
        ) : (
          active.map((session: any) => (
            <Card key={session.id} className="mx-2 sm:mx-4">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                      <span className="truncate">Kode: {session.taaruf_code}</span>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Proses taaruf sedang berjalan
                    </p>
                  </div>
                  <Badge variant="success" className="gap-1 shrink-0">
                    <CheckCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Aktif</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Dimulai:</span>
                    <p className="font-medium mt-1">
                      {session.started_at ? format(new Date(session.started_at), "dd MMM yyyy", { locale: idLocale }) : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium mt-1">{session.status}</p>
                  </div>
                </div>

                {/* Jadwal Zoom (jika ada) */}
                {session.zoom_schedules && session.zoom_schedules.length > 0 && (
                  <div className="pt-2 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Video className="h-4 w-4 text-primary" />
                      <span>Jadwal Pertemuan</span>
                    </div>
                    {session.zoom_schedules.map((zoom: any, index: number) => (
                      <div key={index} className="bg-primary/5 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">{zoom.stage}</span>
                          <Badge variant="info" className="text-xs">Terjadwal</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{zoom.meeting_datetime ? format(new Date(zoom.meeting_datetime), "EEEE, dd MMM yyyy HH:mm", { locale: idLocale }) : "-"}</span>
                        </div>
                        {zoom.zoom_link && (
                          <a 
                            href={zoom.zoom_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:underline"
                          >
                            <LinkIcon className="h-3 w-3" />
                            <span className="truncate">Link Zoom Meeting</span>
                          </a>
                        )}
                        {zoom.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            {zoom.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    💬 Lanjutkan komunikasi taaruf Anda melalui kontak yang telah disepakati
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* Modals */}
      <CvDetailModal
        userId={selectedUserId}
        open={cvDetailOpen}
        onClose={() => setCvDetailOpen(false)}
      />

      <TaarufConfirmationModal
        open={confirmationOpen}
        type={confirmationType}
        candidateCode={selectedCandidateCode}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmationOpen(false)}
        isLoading={actionLoading}
      />
    </Tabs>
  );
}
