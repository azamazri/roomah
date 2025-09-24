"use client";
import { useState, useEffect } from "react";

interface CvDetail {
  namaLengkap: string;
  gender: "M" | "F";
  tanggalLahir: string;
  asalDaerah: string;
  pendidikan: string;
  pekerjaan: string;
  deskripsiDiri: string;
}

export function useCvDetail(userId: string | null) {
  const [data, setData] = useState<CvDetail | null>(null);
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
        const res = await fetch(`/api/admin/cv-queue/${userId}`, {
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
