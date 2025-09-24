"use client";
import { useState, useEffect } from "react";

interface AccountRow {
  userId: string;
  email: string;
  nama: string;
  gender: "M" | "F";
  createdAt: string;
  statusCv: string;
  coinBalance: number;
}
interface AccountListResponse {
  items: AccountRow[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useAccountList(page: number, query: string) {
  const [data, setData] = useState<AccountListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const q = new URLSearchParams();
        q.set("page", String(page));
        if (query) q.set("q", query);
        const res = await fetch(`/api/admin/accounts?${q.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!abort) setData(json);
      } catch (e: any) {
        if (!abort) setError(e.message || "Unknown error");
      } finally {
        if (!abort) setIsLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [page, query]);

  return { data, isLoading, error };
}
