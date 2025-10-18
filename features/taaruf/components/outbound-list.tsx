"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { OutboundItem } from "../types";

export function OutboundList() {
  const [outboundItems, setOutboundItems] = useState<OutboundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutboundItems();
    const interval = setInterval(fetchOutboundItems, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchOutboundItems = async () => {
    try {
      const res = await fetch("/api/taaruf/outbound", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      let json: unknown = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server mengembalikan response non-JSON");
      }
      if (!res.ok) throw new Error(json.error || "Gagal memuat outbound");
      setOutboundItems(json.items ?? []);
    } catch (error) {
      console.error("Error fetching outbound items:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Menunggu Persetujuan",
          variant: "secondary" as const,
          icon: Clock,
          className: "text-orange-600",
        };
      case "accepted":
        return {
          label: "Diterima",
          variant: "default" as const,
          icon: CheckCircle,
          className: "text-green-600",
        };
      case "rejected":
        return {
          label: "Ditolak",
          variant: "destructive" as const,
          icon: XCircle,
          className: "text-red-600",
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
          icon: Clock,
          className: "",
        };
    }
  };

  const getRemainingTime = (autoDeleteAt?: string) => {
    if (!autoDeleteAt) return null;
    const diff = new Date(autoDeleteAt).getTime() - Date.now();
    if (diff <= 0) return "Akan dihapus";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m lagi akan dihapus`;
  };

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
              <div className="h-8 bg-muted rounded w-32"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (outboundItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum Ada CV Dikirim</h3>
          <p>Anda belum mengajukan Taaruf kepada siapapun</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border">
      {outboundItems.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        const StatusIcon = statusInfo.icon;
        const remainingTime = getRemainingTime(item.autoDeleteAt);

        return (
          <div key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {item.kodeKandidat}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(item.waktuPengajuan)}</span>
                </div>

                {remainingTime && item.status === "rejected" && (
                  <div className="text-xs text-muted-foreground italic">
                    {remainingTime}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${statusInfo.className}`} />
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

