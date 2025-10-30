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
    id: "PACKAGE_5",
    koin: 5,
    harga: 25000,
    label: "5 Koin",
  },
  {
    id: "PACKAGE_10",
    koin: 10,
    harga: 50000,
    label: "10 Koin",
    popular: true,
  },
  {
    id: "PACKAGE_100",
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
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Ambil saldo saat mount
  useEffect(() => {
    fetchSaldoKoin();
  }, []);

  // Check if Snap is loaded
  useEffect(() => {
    const checkSnap = () => {
      if (window.snap) {
        setSnapLoaded(true);
      }
    };
    
    // Check immediately
    checkSnap();
    
    // Also check after a delay (in case script is still loading)
    const timer = setTimeout(checkSnap, 2000);
    
    return () => clearTimeout(timer);
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
      console.log("🚀 Starting payment for package:", selectedPackage.id);

      // Request Snap token from API
      const res = await fetch("/api/koin/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      });

      const json = await res.json();
      console.log("📦 API Response:", json);

      if (!res.ok) {
        console.error("❌ API Error:", json.error);
        throw new Error(json.error || "Gagal membuat transaksi");
      }

      // Check if Snap is loaded
      if (!window.snap) {
        console.error("❌ Midtrans Snap not loaded");
        throw new Error("Midtrans Snap belum siap. Silakan refresh halaman.");
      }

      console.log("✅ Snap loaded, opening payment with token:", json.token);
      const orderId = json.orderId as string;

      // Open Midtrans Snap popup
      window.snap.pay(json.token, {
        onSuccess: async (result) => {
          console.log("✅ Payment success:", result);
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
          if (!cRes.ok) {
            console.error("❌ Confirmation error:", cJson.error);
            throw new Error(cJson.error || "Konfirmasi gagal");
          }

          toast.success("Pembayaran berhasil! Saldo diperbarui.");
          await fetchSaldoKoin();
          setShowPaymentModal(false);
          setSelectedPackage(null);
        },
        onPending: (result) => {
          console.log("⏳ Payment pending:", result);
          toast.message("Transaksi pending. Selesaikan pembayaran Anda.");
        },
        onError: (result) => {
          console.error("❌ Payment error:", result);
          toast.error("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          console.log("🚪 Payment popup closed");
        },
      });
    } catch (error) {
      console.error("❌ Payment error:", error);
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
        onLoad={() => {
          setSnapLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load Midtrans Snap script");
          toast.error("Gagal memuat sistem pembayaran. Silakan refresh halaman.");
        }}
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

                  <Button
                    onClick={() => handleTopUpClick(pkg)}
                    className="w-full gap-2 mt-4"
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
        <DialogContent className="sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 sm:space-y-3 px-0 sm:px-1">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Konfirmasi Pembayaran
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Anda akan melakukan top-up koin dengan detail berikut:
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4 px-0 sm:px-1">
              {/* Package Details */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 sm:p-5 space-y-2 sm:space-y-3 border border-primary/20">
                <div className="flex items-center justify-between py-2 border-b border-primary/10">
                  <span className="text-sm font-medium text-muted-foreground">
                    Paket:
                  </span>
                  <span className="text-sm sm:text-base font-semibold">
                    {selectedPackage.label}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-primary/10">
                  <span className="text-sm font-medium text-muted-foreground">
                    Jumlah Koin:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm sm:text-base font-semibold">
                      {selectedPackage.koin} koin
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 sm:py-3">
                  <span className="text-sm sm:text-base font-semibold">
                    Total Pembayaran:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {formatCurrency(selectedPackage.harga)}
                  </span>
                </div>
              </div>

              {/* Sandbox Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Mode Sandbox (Testing)
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Ini adalah simulasi pembayaran untuk testing. Tidak ada
                      transaksi uang sesungguhnya yang diproses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPackage(null);
                  }}
                  className="w-full sm:flex-1 h-11 text-sm sm:text-base order-2 sm:order-1"
                  disabled={isProcessing}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePaymentConfirm}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 h-11 gap-2 text-sm sm:text-base order-1 sm:order-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="whitespace-nowrap">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Bayar Sekarang</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
