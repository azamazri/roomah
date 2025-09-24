"use client";
import { useState, useEffect, useCallback } from "react";
type TaarufStage =
  | "Pengajuan"
  | "Screening"
  | "Zoom 1"
  | "Zoom 2"
  | "Keputusan"
  | "Selesai";
interface TaarufCard {
  id: string;
  pasanganKode: [string, string];
  stage: TaarufStage;
  lastUpdate: string;
}
type KanbanData = Record<TaarufStage, TaarufCard[]>;

export function useTaarufKanban() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/taaruf/kanban", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback(
    async (updateFn?: () => Promise<KanbanData | null | undefined>) => {
      if (updateFn) {
        try {
          const newData = await updateFn();
          if (newData) setData(newData);
        } catch {
          await fetchData();
          throw new Error("Mutation failed");
        }
      } else {
        await fetchData();
      }
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate };
}
