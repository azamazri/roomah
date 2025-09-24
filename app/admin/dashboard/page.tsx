import { Suspense } from "react";
import { DashboardKpi } from "@/features/admin/components/dashboard-kpi";
import { RecentTransactions } from "@/features/admin/components/recent-transactions";
import { RecentTaaruf } from "@/features/admin/components/recent-taaruf";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan progress platform dan keuangan
        </p>
      </div>

      <Suspense fallback={<DashboardKpiSkeleton />}>
        <DashboardKpi />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<TableSkeleton />}>
          <RecentTransactions />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <RecentTaaruf />
        </Suspense>
      </div>
    </div>
  );
}

function DashboardKpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-card border rounded-lg p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-card border rounded-lg">
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-muted rounded w-1/3"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
