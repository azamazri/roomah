// features/admin/components/account-detail-modal.tsx
"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Coins,
  Heart,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
// ❌ HAPUS: import { useAccountDetail } from "../hooks/use-account-detail";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface AccountDetailModalProps {
  userId: string | null;
  onClose: () => void;
}

// Hook lokal pengganti useAccountDetail (tanpa bikin file baru)
function useAccountDetailLocal(userId: string | null) {
  const fetcher = async (url: string) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch account detail");
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/admin/accounts/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
    }
  );

  return { data, error, isLoading, mutate };
}

export function AccountDetailModal({
  userId,
  onClose,
}: AccountDetailModalProps) {
  const { data: account, isLoading } = useAccountDetailLocal(userId);

  if (!userId) return null;

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <Badge variant="success">Disetujui</Badge>;
      case "REVIEW":
        return <Badge variant="warning">Review</Badge>;
      case "REVISI":
        return <Badge variant="destructive">Revisi</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">Belum Ada CV</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "taaruf_request":
        return <Heart className="h-4 w-4 text-primary" />;
      case "coin_transaction":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "cv_update":
        return <FileText className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityLabel = (activity: any) => {
    // Use description from API
    return activity.description || "Aktivitas tidak dikenal";
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Detail Akun Pengguna
        </DialogTitle>
      </DialogHeader>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ) : account ? (
        <div className="space-y-6 px-2">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Nama</div>
                      <div className="font-medium">{account.nama}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{account.email}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Terdaftar
                      </div>
                      <div className="font-medium">
                        {new Date(account.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Gender
                      </div>
                      <div className="font-medium">
                        {account.gender === "M" ? "Ikhwan" : "Akhwat"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Coins Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status CV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusBadge(account.statusCv)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Saldo Koin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {account.coinBalance.toLocaleString("id-ID")}
                </div>
                <div className="text-sm text-muted-foreground">
                  koin tersedia
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline Aktivitas</CardTitle>
            </CardHeader>
            <CardContent>
              {(account.activities?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Belum ada aktivitas</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {account.activities.map((activity: unknown, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {getActivityLabel(activity)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </div>
                        {activity.id && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {activity.id}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Data akun tidak ditemukan
        </div>
      )}
    </DialogContent>
  );
}
