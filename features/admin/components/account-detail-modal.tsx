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
import { useAccountDetail } from "../hooks/use-account-detail";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface AccountDetailModalProps {
  userId: string | null;
  onClose: () => void;
}

export function AccountDetailModal({
  userId,
  onClose,
}: AccountDetailModalProps) {
  const { data: account, isLoading } = useAccountDetail(userId);

  if (!userId) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approve":
        return <Badge variant="success">Disetujui</Badge>;
      case "review":
        return <Badge variant="warning">Review</Badge>;
      case "revisi":
        return <Badge variant="destructive">Revisi</Badge>;
      default:
        return <Badge variant="default">-</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "taaruf_ajukan":
        return <Heart className="h-4 w-4 text-primary" />;
      case "coin_topup":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "cv_update":
        return <FileText className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityLabel = (activity: any) => {
    switch (activity.type) {
      case "taaruf_ajukan":
        return `Mengajukan ta'aruf${
          activity.targetKode ? ` ke ${activity.targetKode}` : ""
        }`;
      case "coin_topup":
        return `Top up koin sebesar Rp ${activity.amount.toLocaleString(
          "id-ID"
        )}`;
      case "cv_update":
        return "Memperbarui CV";
      default:
        return "Aktivitas tidak dikenal";
    }
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
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent>
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
              {account.activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Belum ada aktivitas</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {account.activities.map((activity, index) => (
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
                          {formatDistanceToNow(new Date(activity.at), {
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
