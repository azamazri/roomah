"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

export function useCoinTransactions(page = 1, status = "", from = "", to = "") {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (status) params.set("status", status);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/coin-topups?${params.toString()}`,
    fetcher
  );

  return { data, error, isLoading, mutate };
}
