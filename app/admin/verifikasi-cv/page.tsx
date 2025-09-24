import { Suspense } from "react";
import { CvVerificationList } from "@/features/admin/components/cv-verification-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

interface PageProps {
  searchParams: {
    page?: string;
    q?: string;
  };
}

export default function VerifikasiCvPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || "1");
  const query = searchParams.q || "";

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
