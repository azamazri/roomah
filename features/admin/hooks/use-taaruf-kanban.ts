"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

export function useTaarufKanban() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/taaruf/kanban`,
    fetcher,
    { refreshInterval: 15000 } // biar realtime-ish
  );

  return { data, error, isLoading, mutate };
}
