"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { FileCheck, Clock, Search, Eye } from "lucide-react";
import { AdminTable } from "./admin-table";
import { AdminPagination } from "./admin-pagination";
import { CvReviewModal } from "./cv-review-modal";
import { useCvVerification } from "../hooks/use-cv-verification";
import { useRouter, useSearchParams } from "next/navigation";
import type { CvQueueItem } from "../types";

interface CvVerificationListProps {
  page: number;
  query: string;
}

export function CvVerificationList({ page, query }: CvVerificationListProps) {
  const [selectedCv, setSelectedCv] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, error, mutate } = useCvVerification(page, query);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/admin/verifikasi-cv?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/verifikasi-cv?${params.toString()}`);
  };

  const handleReview = (userId: string) => {
    setSelectedCv(userId);
    setReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    setSelectedCv(null);
    setReviewModalOpen(false);
    // Trigger revalidation to refresh the list
    mutate();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive">
            Gagal memuat data CV. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    {
      key: "nama",
      label: "Nama",
      render: (item: CvQueueItem) => (
        <div className="space-y-1">
          <div className="font-medium">{item.nama}</div>
          <div className="text-sm text-muted-foreground">
            {item.gender === "M" ? "Ikhwan" : "Akhwat"}
          </div>
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Tanggal Kirim",
      render: (item: CvQueueItem) => {
        const date = new Date(item.submittedAt);
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
      label: "Status",
      render: (item: CvQueueItem) => (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Review
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (item: CvQueueItem) => (
        <Button
          size="sm"
          onClick={() => handleReview(item.userId)}
          className="gap-1"
        >
          <Eye className="h-3 w-3" />
          Review
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
                <FileCheck className="h-5 w-5" />
                Antrian Verifikasi CV
                {data && <Badge variant="warning">{data.total}</Badge>}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama pengguna..."
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
            emptyMessage="Tidak ada CV yang menunggu verifikasi"
            emptyIcon={FileCheck}
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

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <CvReviewModal
          userId={selectedCv}
          onComplete={handleReviewComplete}
          onClose={() => setReviewModalOpen(false)}
        />
      </Dialog>
    </div>
  );
}
