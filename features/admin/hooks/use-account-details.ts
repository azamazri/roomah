"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

export function useAccountDetail(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/admin/accounts/${userId}` : null,
    fetcher
  );
  return { data, error, isLoading };
}
