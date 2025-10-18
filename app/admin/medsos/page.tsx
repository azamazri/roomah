// app/admin/medsos/page.tsx
import { requireAdmin } from "@/server/guards";
import { ensureAdminRole } from "@/server/authz";

export default async function AdminMedsosPage() {
  await requireAdmin("/admin/medsos");
  await ensureAdminRole("MEDSOS");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Manajemen Media Sosial
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola postingan kandidat ke media sosial (Instagram, Facebook, dll)
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Antrian Postingan</h2>
            <span className="text-sm text-muted-foreground">
              Belum ada data postingan
            </span>
          </div>
          
          <div className="text-center py-12 text-muted-foreground">
            <p>Fitur manajemen media sosial sedang dalam pengembangan.</p>
            <p className="text-sm mt-2">
              Akan menampilkan antrian postingan kandidat yang sudah disetujui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
