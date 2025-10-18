// app/admin/verifikasi-cv/page.tsx
import { Suspense } from "react";
import { CvVerificationList } from "@/features/admin/components/cv-verification-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

interface PageProps {
  // Next.js 15: searchParams harus berupa Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifikasiCvPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Handle array vs string agar aman
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const qParam = Array.isArray(sp.q) ? sp.q[0] : sp.q;

  const currentPage = Number(pageParam ?? "1") || 1;
  const query = qParam ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifikasi CV</h1>
        <p className="text-muted-foreground">
          Review dan verifikasi CV pengguna yang menunggu persetujuan
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />} key={`${currentPage}-${query}`}>
        <CvVerificationList page={currentPage} query={query} />
      </Suspense>
    </div>
  );
}
