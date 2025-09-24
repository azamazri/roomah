import { cookies } from "next/headers";

export type Gender = "M" | "F";

export interface User {
  id: string;
  gender: Gender;
  statusCv: "approve" | "review" | "revisi";
  saldoKoin: number;
  hasActiveTaaruf: boolean;
}

// Mock user data
const mockUsers: Record<string, User> = {
  user123: {
    id: "user123",
    gender: "M",
    statusCv: "approve",
    saldoKoin: 15,
    hasActiveTaaruf: false,
  },
};

export async function getUser(): Promise<User> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("rmh_auth");

  if (authCookie?.value !== "1") {
    throw new Error("User not authenticated");
  }

  // In real implementation, get user ID from token/session
  // For now, return mock user
  return mockUsers["user123"];
}
