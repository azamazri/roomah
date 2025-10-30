"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

/**
 * Hook for ajukan taaruf with validation guards
 */
export function useAjukanTaaruf() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const ajukan = async (toUserId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/taaruf/ajukan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error codes with redirects
        if (data.errorCode === "CV_NOT_FOUND" || data.errorCode === "CV_NOT_APPROVED") {
          toast.error(data.error);
          router.push("/cv-saya");
          return { success: false, error: data.error };
        }

        if (data.errorCode === "INSUFFICIENT_KOIN") {
          toast.error(data.error);
          router.push("/koin-saya");
          return { success: false, error: data.error };
        }

        if (data.errorCode === "ACTIVE_TAARUF_EXISTS") {
          toast.error(data.error);
          router.push("/riwayat-taaruf");
          return { success: false, error: data.error };
        }

        // Generic error
        toast.error(data.error || "Gagal mengajukan taaruf");
        return { success: false, error: data.error };
      }

      // Success
      toast.success(data.message || "Taaruf berhasil diajukan!");
      return { success: true, koinDeducted: data.koinDeducted };

    } catch (error) {
      console.error("Error ajukan taaruf:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      return { success: false, error: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  return { ajukan, isLoading };
}

/**
 * Hook for incoming taaruf requests (CV Masuk)
 */
export function useIncomingRequests() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/taaruf/requests/incoming",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  );

  return {
    requests: data?.data || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook for sent taaruf requests (CV Dikirim)
 */
export function useSentRequests() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/taaruf/requests/sent",
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    requests: data?.data || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook for active taaruf sessions
 */
export function useActiveTaaruf() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/taaruf/active",
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    sessions: data?.data || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook for accept/reject taaruf request
 */
export function useTaarufActions() {
  const [isLoading, setIsLoading] = useState(false);

  const acceptRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/taaruf/requests/${requestId}/accept`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menerima pengajuan");
        return { success: false };
      }

      toast.success(data.message || "Taaruf berhasil dimulai!");
      return { success: true, taarufCode: data.taarufCode };

    } catch (error) {
      console.error("Error accepting taaruf:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/taaruf/requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menolak pengajuan");
        return { success: false };
      }

      toast.success(data.message || "Pengajuan berhasil ditolak");
      return { success: true };

    } catch (error) {
      console.error("Error rejecting taaruf:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { acceptRequest, rejectRequest, isLoading };
}
