import type { CoinRecord } from "../types";
import { PAGINATION_SIZE } from "../constants";

interface CoinTransactionResponse {
  items: CoinRecord[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listCoinTransactions(
  page: number = 1,
  status: string = "",
  from: string = "",
  to: string = ""
): Promise<CoinTransactionResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - replace with actual database queries
  const mockData: CoinRecord[] = [
    {
      id: "tx-001",
      userId: "user-12345678",
      amount: 50000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "tx-002",
      userId: "user-87654321",
      amount: 100000,
      status: "pending",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: "tx-003",
      userId: "user-11111111",
      amount: 25000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    },
    {
      id: "tx-004",
      userId: "user-22222222",
      amount: 75000,
      status: "deny",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "tx-005",
      userId: "user-33333333",
      amount: 50000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: "tx-006",
      userId: "user-44444444",
      amount: 200000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    },
    {
      id: "tx-007",
      userId: "user-55555555",
      amount: 30000,
      status: "pending",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    },
    {
      id: "tx-008",
      userId: "user-66666666",
      amount: 150000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    },
    {
      id: "tx-009",
      userId: "user-77777777",
      amount: 80000,
      status: "deny",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: "tx-010",
      userId: "user-88888888",
      amount: 120000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      id: "tx-011",
      userId: "user-99999999",
      amount: 60000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
  ];

  // Filter by status
  let filtered = status
    ? mockData.filter((item) => item.status === status)
    : mockData;

  // Filter by date range
  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter((item) => new Date(item.createdAt) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter((item) => new Date(item.createdAt) <= toDate);
  }

  // Sort by created date descending
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGINATION_SIZE);
  const start = (page - 1) * PAGINATION_SIZE;
  const items = filtered.slice(start, start + PAGINATION_SIZE);

  return {
    items,
    total,
    totalPages,
    currentPage: page,
  };
}

// Polling function for realtime updates
export async function pollMidtransStatus(): Promise<void> {
  // TODO: Implement actual Midtrans webhook/polling

  // This would typically:
  // 1. Check for pending transactions
  // 2. Query Midtrans API for status updates
  // 3. Update database with new statuses
  // 4. Revalidate cache tags

  console.log("Polling Midtrans for transaction status updates...");

  // Mock: Simulate finding updated transactions
  const updatedTransactions = await checkMidtransUpdates();

  if (updatedTransactions.length > 0) {
    console.log(`Found ${updatedTransactions.length} transaction updates`);
    // Revalidate cache
    // revalidateTag('coin-transactions');
  }
}

async function checkMidtransUpdates(): Promise<string[]> {
  // Mock implementation
  // In real app, this would query Midtrans API

  // Simulate occasional updates
  const hasUpdates = Math.random() > 0.8; // 20% chance

  if (hasUpdates) {
    return ["tx-002", "tx-007"]; // Mock transaction IDs that got updated
  }

  return [];
}

// Export utility for manual refresh
export async function refreshTransactionData(): Promise<void> {
  await pollMidtransStatus();
  // Additional refresh logic if needed
}
