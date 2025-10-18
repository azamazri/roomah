// app/admin/manajemen-akun/page.tsx
import { Suspense } from "react";
import { AccountManagementList } from "@/features/admin/components/account-management-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

interface PageProps {
  // Next.js 15: searchParams adalah Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ManajemenAkunPage({ searchParams }: PageProps) {
  const sp = await searchParams; // ← penting

  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const qParam = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  const currentPage = Number(pageParam ?? "1") || 1;
  const query = qParam ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Akun</h1>
        <p className="text-muted-foreground">
          Kelola semua akun pengguna dan lihat aktivitas mereka
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />} key={`${currentPage}-${query}`}>
        <AccountManagementList page={currentPage} query={query} />
      </Suspense>
    </div>
  );
}
