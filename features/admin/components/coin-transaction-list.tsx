"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Coins,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { AdminTable } from "./admin-table";
import { AdminPagination } from "./admin-pagination";
import { FilterToolbar } from "./filter-toolbar";
import { useCoinTransactions } from "../hooks/use-coin-transactions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import type { CoinRecord } from "../types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface CoinTransactionListProps {
  page: number;
  status: string;
  from: string;
  to: string;
}

export function CoinTransactionList({
  page,
  status,
  from,
  to,
}: CoinTransactionListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, error, mutate } = useCoinTransactions(
    page,
    status,
    from,
    to
  );

  // Polling untuk realtime updates setiap 15 detik
  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 15000);

    return () => clearInterval(interval);
  }, [mutate]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/admin/koin-transaksi?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/koin-transaksi?${params.toString()}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
      toast.success("Data berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Fitur export akan segera hadir");
  };

  const getTotalRevenue = () => {
    if (!data) return 0;
    return data.items
      .filter((item) => item.status === "settlement")
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "settlement":
        return <Badge variant="success">Berhasil</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "deny":
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            Gagal memuat data transaksi. Silakan coba lagi.
          </div>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    {
      key: "id",
      label: "ID Transaksi",
      render: (item: any) => (
        <div className="font-mono text-xs truncate max-w-[200px]" title={item.id || 'N/A'}>
          {item.id || <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      key: "user",
      label: "Pengguna",
      render: (item: any) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {item.userName || "Unknown"}
          </div>
          <div className="text-xs text-muted-foreground">{item.userEmail || "-"}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Jumlah",
      render: (item: any) => (
        <div className="text-right">
          <div className={`font-semibold ${item.type === 'topup' ? 'text-success' : 'text-warning'}`}>
            {item.type === 'topup' ? '+' : '-'} {item.amount || 0} Koin
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: "createdAt",
      label: "Waktu",
      render: (item: any) => {
        if (!item.createdAt) {
          return <div className="text-sm text-muted-foreground">-</div>;
        }
        
        const date = new Date(item.createdAt);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return <div className="text-sm text-muted-foreground">Invalid date</div>;
        }
        
        return (
          <div className="space-y-1">
            <div className="text-sm">{date.toLocaleDateString("id-ID")}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(date, {
                addSuffix: true,
                locale: id,
              })}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-warning" />
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
            <div className="text-xs text-muted-foreground">
              periode saat ini
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              Rp {getTotalRevenue().toLocaleString("id-ID")}
            </div>
            <div className="text-xs text-muted-foreground">
              transaksi berhasil
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Status Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                Realtime Active
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Update setiap 15 detik
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Actions */}
      <FilterToolbar
        status={status}
        from={from}
        to={to}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Daftar Transaksi
            {data && <Badge variant="info">{data.total}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            emptyMessage="Tidak ada transaksi ditemukan"
            emptyIcon={Coins}
            renderRowFooter={(item: any) => (
              <div className="text-sm text-muted-foreground">
                {item.description || '-'}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
