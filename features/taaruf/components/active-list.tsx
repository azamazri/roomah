"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, User } from "lucide-react";
import { ActiveItem } from "../types";
import { getActiveTaaruf } from "../server/actions";

export function ActiveList() {
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveItems();
  }, []);

  const fetchActiveItems = async () => {
    try {
      const items = await getActiveTaaruf();
      setActiveItems(items);
    } catch (error) {
      console.error("Error fetching active items:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} hari ${hours} jam`;
    }
    return `${hours} jam`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-input rounded-md">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </div>
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-36"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activeItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belum Ada Ta'aruf Aktif</h3>
          <p>Anda belum memiliki proses Ta'aruf yang sedang berjalan</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeItems.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ta'aruf Aktif</h3>
                  <p className="text-sm text-muted-foreground">
                    Proses Ta'aruf sedang berlangsung
                  </p>
                </div>
              </div>

              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                Aktif
              </Badge>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-input">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Kode Ta'aruf:</span>
                  <Badge variant="outline" className="font-mono">
                    {item.kodeTaaruf}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dengan:</span>
                  <Badge variant="outline" className="font-mono">
                    {item.kodeKandidat}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dimulai:</span>
                  <span className="text-muted-foreground">
                    {formatDate(item.waktuMulai)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Durasi:</span>
                  <span className="text-muted-foreground">
                    {getDuration(item.waktuMulai)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
              <p>
                🎉 Selamat! Ta'aruf Anda telah dimulai. Silakan lanjutkan
                komunikasi dengan kandidat melalui admin untuk proses
                selanjutnya.
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Add Clock import
import { Clock } from "lucide-react";
