import { Suspense } from "react";
import { CoinTransactionList } from "@/features/admin/components/coin-transaction-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

interface PageProps {
  searchParams: {
    page?: string;
    status?: string;
    from?: string;
    to?: string;
  };
}

export default function KoinTransaksiPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || "1");
  const status = searchParams.status || "";
  const from = searchParams.from || "";
  const to = searchParams.to || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Koin & Transaksi</h1>
        <p className="text-muted-foreground">
          Rekap semua transaksi top up koin melalui Midtrans dengan monitoring
          realtime
        </p>
      </div>

      <Suspense
        fallback={<TableSkeleton />}
        key={`${currentPage}-${status}-${from}-${to}`}
      >
        <CoinTransactionList
          page={currentPage}
          status={status}
          from={from}
          to={to}
        />
      </Suspense>
    </div>
  );
}
