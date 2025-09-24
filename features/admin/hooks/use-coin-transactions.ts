"use client";
import { useState, useEffect, useCallback } from "react";

interface CoinRecord {
  id: string;
  userId: string;
  amount: number;
  status: string;
  provider: string;
  createdAt: string;
}
interface CoinTransactionResponse {
  items: CoinRecord[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useCoinTransactions(
  page: number,
  status: string,
  from: string,
  to: string
) {
  const [data, setData] = useState<CoinTransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const q = new URLSearchParams();
      q.set("page", String(page));
      if (status) q.set("status", status);
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      const res = await fetch(`/api/admin/coins?${q.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, status, from, to]);

  const mutate = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate };
}
