"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

export function useCvVerification(page = 1, q = "") {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (q) params.set("q", q);

  const { data, error, isLoading } = useSWR(
    `/api/admin/cv-queue?${params.toString()}`,
    fetcher
  );

  return { data, error, isLoading };
}
