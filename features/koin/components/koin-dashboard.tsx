"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        opts?: {
          onSuccess?: (result?: unknown) => void;
          onPending?: (result?: unknown) => void;
          onError?: (result?: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface TopUpPackage {
  id: string;
  koin: number;
  harga: number;
  label: string;
  popular?: boolean;
}

const topUpPackages: TopUpPackage[] = [
  {
    id: "package_5",
    koin: 5,
    harga: 25000,
    label: "5 Koin",
  },
  {
    id: "package_10",
    koin: 10,
    harga: 50000,
    label: "10 Koin",
    popular: true,
  },
  {
    id: "package_100",
    koin: 100,
    harga: 100000,
    label: "100 Koin",
  },
];

export function KoinDashboard() {
  const [saldoKoin, setSaldoKoin] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Ambil saldo saat mount
  useEffect(() => {
    fetchSaldoKoin();
  }, []);

  const fetchSaldoKoin = async () => {
    try {
      const res = await fetch("/api/koin/saldo", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat saldo");
      setSaldoKoin(json.balance ?? 0);
    } catch (error) {
      console.error("Error fetching saldo koin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpClick = (packageData: TopUpPackage) => {
    setSelectedPackage(packageData);
    setShowPaymentModal(true);
  };

  // Confirm → request Snap token → buka popup Snap → webhook update saldo → refresh saldo
  const handlePaymentConfirm = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/koin/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat transaksi");

      if (!window.snap) throw new Error("Midtrans Snap belum siap");
      const orderId = json.orderId as string;

      window.snap.pay(json.token, {
        onSuccess: async () => {
          // konfirmasi ke server → credit saldo
          const cRes = await fetch("/api/koin/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ orderId }),
          });
          const cJson = await cRes.json();
          if (!cRes.ok) throw new Error(cJson.error || "Konfirmasi gagal");

          toast.success("Pembayaran berhasil! Saldo diperbarui.");
          await fetchSaldoKoin();
          setShowPaymentModal(false);
          setSelectedPackage(null);
        },
        onPending: () =>
          toast.message("Transaksi pending. Selesaikan pembayaran Anda."),
        onError: () => toast.error("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => {},
      });
    } catch (error) {
      toast.error(
        (error as Error).message || "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <>
        {/* Snap loader tetap dipasang agar siap ketika user selesai loading */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-12 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Snap.js Sandbox (best practice: afterInteractive + data-client-key) */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="space-y-6">
        {/* Saldo Koin */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Saldo Koin Anda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gunakan koin untuk mengajukan Ta'aruf (5 koin per
                  pengajuan)
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{saldoKoin}</div>
              <div className="text-sm text-muted-foreground">Koin</div>
            </div>
          </div>
        </Card>

        {/* Top Up Packages */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Pilihan Top-Up Koin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topUpPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 relative ${
                  pkg.popular ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    <Zap className="h-3 w-3 mr-1" />
                    Populer
                  </Badge>
                )}

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <Coins className="h-6 w-6 text-secondary-foreground" />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold">{pkg.label}</h4>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatCurrency(pkg.harga)}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>• {pkg.koin} koin</p>
                    <p>• {Math.floor(pkg.koin / 5)} kali ajukan Ta'aruf</p>
                  </div>

                  <Button
                    onClick={() => handleTopUpClick(pkg)}
                    className="w-full gap-2"
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    <CreditCard className="h-4 w-4" />
                    Beli Sekarang
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-info/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-info rounded-full"></div>
            </div>
            <div className="text-sm">
              <h4 className="font-medium mb-1">Informasi Penggunaan Koin</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Setiap pengajuan Ta'aruf membutuhkan 5 koin</li>
                <li>• Koin tidak akan dikembalikan jika pengajuan ditolak</li>
                <li>• Saldo koin tidak memiliki masa expired</li>
                <li>• Pembayaran menggunakan sistem yang aman</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Modal - Midtrans Sandbox */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Anda akan melakukan top-up koin dengan detail berikut:
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Paket:</span>
                  <span className="text-sm">{selectedPackage.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Jumlah Koin:</span>
                  <span className="text-sm">{selectedPackage.koin} koin</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Pembayaran:</span>
                  <span className="text-primary">
                    {formatCurrency(selectedPackage.harga)}
                  </span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-800">
                  <div className="w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Mode Sandbox</span>
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Ini adalah simulasi pembayaran untuk testing. Tidak ada
                  transaksi sesungguhnya.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePaymentConfirm}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? "Memproses..." : "Bayar Sekarang"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
