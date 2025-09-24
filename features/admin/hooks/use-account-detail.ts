"use client";
import { useState, useEffect } from "react";

interface AccountDetail {
  userId: string;
  email: string;
  nama: string;
  gender: "M" | "F";
  createdAt: string;
  statusCv: string;
  coinBalance: number;
  activities: any[];
}

export function useAccountDetail(userId: string | null) {
  const [data, setData] = useState<AccountDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }
    let abort = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/accounts/${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!abort) setData(json);
      } catch {
        if (!abort) setData(null);
      } finally {
        if (!abort) setIsLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [userId]);

  return { data, isLoading };
}
