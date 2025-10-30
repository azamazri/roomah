// app/admin/pengaturan/page.tsx
import { requireAdmin } from "@/server/authz";

export default async function AdminPengaturanPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Pengaturan Platform
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola pengaturan sistem dan konfigurasi platform Roomah
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Pengaturan Umum</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium">Biaya Ta&apos;aruf</p>
                <p className="text-sm text-muted-foreground">
                  Biaya per pengajuan ta&apos;aruf (dalam koin)
                </p>
              </div>
              <span className="text-lg font-semibold">5 Koin</span>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium">Batas Waktu Respon</p>
                <p className="text-sm text-muted-foreground">
                  Waktu maksimal untuk menerima/menolak pengajuan
                </p>
              </div>
              <span className="text-lg font-semibold">7 Hari</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mode Maintenance</p>
                <p className="text-sm text-muted-foreground">
                  Nonaktifkan sementara akses platform
                </p>
              </div>
              <span className="text-lg font-semibold text-success">
                Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Paket Koin</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span>Paket 5 Koin</span>
              <span className="font-semibold">Rp 25.000</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span>Paket 10 Koin</span>
              <span className="font-semibold">Rp 50.000</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Paket 100 Koin</span>
              <span className="font-semibold">Rp 100.000</span>
            </div>
          </div>
        </div>

        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Fitur edit pengaturan akan tersedia di versi berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
}

