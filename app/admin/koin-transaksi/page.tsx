import { Suspense } from "react";
import { CoinTransactionList } from "@/features/admin/components/coin-transaction-list";
import { TableSkeleton } from "@/features/admin/components/table-skeleton";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function KoinTransaksiPage({ searchParams }: PageProps) {
  const sp = await searchParams; // ⬅️ penting!

  const currentPage = parseInt((sp.page ?? "1") as string, 10);
  const status = (sp.status ?? "") as string;
  const from = (sp.from ?? "") as string;
  const to = (sp.to ?? "") as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Koin & Transaksi</h1>
        <p className="text-muted-foreground">
          Monitor dan kelola transaksi top up koin pengguna
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
