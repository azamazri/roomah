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
    <div className="space-y-4">
      {outboundItems.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        const remainingTime = getRemainingTime(item.autoDeleteAt);

        return (
          <Card key={item.id} className="p-6">
            {/* Baris 1: Kode Kandidat & Status */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-foreground">
                {item.kodeKandidat}
              </h3>
              <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                {statusInfo.label}
              </Badge>
            </div>

            {/* Baris 2: Waktu Pengajuan & Countdown/Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatDate(item.waktuPengajuan)}</span>
              
              {item.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Waktu mundur {calculateTimeRemaining(item.waktuPengajuan)}</span>
                </div>
              )}
              
              {item.status === "rejected" && remainingTime && (
                <div className="flex items-center gap-2 text-xs italic">
                  <Clock className="h-4 w-4" />
                  <span>{remainingTime}</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

