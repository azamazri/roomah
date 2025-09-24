import { Metadata } from "next";
import { KoinDashboard } from "@/features/koin/components/koin-dashboard";

export const metadata: Metadata = {
  title: "Koin Saya - Roomah",
  description: "Kelola saldo koin untuk proses Ta&apos;aruf",
  robots: "noindex",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Koin Saya</h1>
        <p className="text-muted-foreground">
          Kelola saldo koin untuk mengajukan Ta&apos;aruf
        </p>
      </div>

      <KoinDashboard />
    </div>
  );
}
