import { Suspense } from "react";
import { AccountManagementList } from "@/features/admin/components/account-management-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

interface PageProps {
  searchParams: {
    page?: string;
    q?: string;
  };
}

export default function ManajemenAkunPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || "1");
  const query = searchParams.q || "";

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
