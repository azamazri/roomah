import { Metadata } from "next";
import { TaarufTabs } from "@/features/taaruf/components/taaruf-tabs";

export const metadata: Metadata = {
  title: "Riwayat Ta'aruf - Roomah",
  description: "Kelola proses Ta'aruf Anda",
  robots: "noindex",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Riwayat Ta'aruf
        </h1>
        <p className="text-muted-foreground">
          Kelola proses Ta'aruf yang masuk, dikirim, dan sedang aktif
        </p>
      </div>

      <TaarufTabs />
    </div>
  );
}
