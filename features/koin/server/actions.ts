"use server";

import { getUser } from "@/features/auth/lib/session";

// Mock storage untuk saldo koin
const mockKoinStorage = new Map<string, number>();

// Initialize mock data
mockKoinStorage.set("user123", 15); // Mock user has 15 koin

export async function getSaldoKoin(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  return mockKoinStorage.get(user.id) || 0;
}

export async function topUpKoin(jumlahKoin: number) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Get current saldo
    const currentSaldo = mockKoinStorage.get(user.id) || 0;

    // Add koin to current saldo
    const newSaldo = currentSaldo + jumlahKoin;
    mockKoinStorage.set(user.id, newSaldo);

    return {
      success: true,
      newSaldo,
      addedKoin: jumlahKoin,
    };
  } catch (error) {
    return {
      success: false,
      error: "Payment processing failed",
    };
  }
}

export async function deductKoin(jumlahKoin: number) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const currentSaldo = mockKoinStorage.get(user.id) || 0;

    if (currentSaldo < jumlahKoin) {
      return { success: false, error: "Insufficient coins" };
    }

    const newSaldo = currentSaldo - jumlahKoin;
    mockKoinStorage.set(user.id, newSaldo);

    return {
      success: true,
      newSaldo,
      deductedKoin: jumlahKoin,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to deduct coins",
    };
  }
}
