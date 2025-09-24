"use client";

// Helper functions for managing mock session flags
// These work with both cookies (server-side) and sessionStorage (client-side)

export function setOnboardingFlag(key: string, value: string) {
  // Set in sessionStorage for immediate UI updates
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }

  // Set cookie for server-side access
  document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
}

export function getOnboardingFlag(key: string): string {
  // Try sessionStorage first for immediate access
  if (typeof window !== "undefined") {
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
  }

  // Fallback to cookie parsing
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`));
    if (cookie) {
      return cookie.split("=")[1];
    }
  }

  return "";
}

export function clearOnboardingFlags() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("rmh_auth");
    sessionStorage.removeItem("rmh_5q");
    sessionStorage.removeItem("rmh_cv");
  }

  // Clear cookies
  document.cookie = "rmh_auth=; path=/; max-age=0";
  document.cookie = "rmh_5q=; path=/; max-age=0";
  document.cookie = "rmh_cv=; path=/; max-age=0";
}

export function getAuthStatus() {
  const auth = getOnboardingFlag("rmh_auth");
  const fiveQ = getOnboardingFlag("rmh_5q");
  const cv = getOnboardingFlag("rmh_cv");

  return {
    isAuthenticated: auth === "1",
    fiveQCompleted: fiveQ === "1",
    cvCompleted: cv === "1",
    cvSkipped: cv === "0",
    onboardingComplete: fiveQ === "1" && (cv === "0" || cv === "1"),
  };
}
