"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Users, Search, Eye, Coins } from "lucide-react";
import { AdminTable } from "./admin-table";
import { AdminPagination } from "./admin-pagination";
import { AccountDetailModal } from "./account-detail-modal";
import { useAccountList } from "../hooks/use-account-list";
import { useRouter, useSearchParams } from "next/navigation";
import type { AccountRow } from "../types";

interface AccountManagementListProps {
  page: number;
  query: string;
}

export function AccountManagementList({
  page,
  query,
}: AccountManagementListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, error } = useAccountList(page, query);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/admin/manajemen-akun?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/manajemen-akun?${params.toString()}`);
  };

  const handleViewDetail = (userId: string) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
  };

  const handleDetailClose = () => {
    setSelectedUserId(null);
    setDetailModalOpen(false);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive">
            Gagal memuat data akun. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <Badge variant="success">Disetujui</Badge>;
      case "REVIEW":
        return <Badge variant="warning">Review</Badge>;
      case "REVISI":
        return <Badge variant="destructive">Revisi</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">Belum Ada</Badge>;
    }
  };

  const columns = [
    {
      key: "nama",
      label: "Pengguna",
      render: (item: AccountRow) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nama}</div>
          <div className="text-sm text-muted-foreground">{item.email}</div>
          <div className="text-xs text-muted-foreground">
            {item.gender === "M" ? "Ikhwan" : "Akhwat"}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Terdaftar",
      render: (item: AccountRow) => {
        const date = new Date(item.createdAt);
        return (
          <div className="space-y-1">
            <div className="text-sm">{date.toLocaleDateString("id-ID")}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status CV",
      render: (item: AccountRow) => getStatusBadge(item.statusCv),
    },
    {
      key: "coins",
      label: "Saldo Koin",
      render: (item: AccountRow) => (
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-warning" />
          <span className="font-medium">
            {item.coinBalance.toLocaleString("id-ID")}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (item: AccountRow) => (
        <Button
          size="sm"
          onClick={() => handleViewDetail(item.userId)}
          className="gap-1"
        >
          <Eye className="h-3 w-3" />
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header dengan Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar Akun Pengguna
                {data && <Badge variant="info">{data.total}</Badge>}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  defaultValue={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    const timeoutId = setTimeout(
                      () => handleSearch(value),
                      300
                    );
                    return () => clearTimeout(timeoutId);
                  }}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            emptyMessage="Tidak ada pengguna ditemukan"
            emptyIcon={Users}
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

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <AccountDetailModal
          userId={selectedUserId}
          onClose={handleDetailClose}
        />
      </Dialog>
    </div>
  );
}
