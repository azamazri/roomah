import type { AdminKpi, CoinRecord, TaarufCard } from "../types";

// TODO: Replace with actual database queries
export async function getKpiData(): Promise<AdminKpi> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data - replace with actual database queries
  return {
    totalUsers: 1247,
    activeTaaruf: 23,
    approvedCV: 892,
    pendingCV: 12,
    coinTopupToday: 2850000,
    revenueMTD: 15750000,
    profitMTD: 12600000,
  };
}

export async function getLatestTransactions(): Promise<CoinRecord[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data - replace with actual database queries
  return [
    {
      id: "tx-001",
      userId: "user-12345",
      amount: 50000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "tx-002",
      userId: "user-67890",
      amount: 100000,
      status: "pending",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: "tx-003",
      userId: "user-54321",
      amount: 25000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    },
    {
      id: "tx-004",
      userId: "user-98765",
      amount: 75000,
      status: "deny",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "tx-005",
      userId: "user-11111",
      amount: 50000,
      status: "settlement",
      provider: "midtrans",
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
  ];
}

export async function getLatestTaaruf(): Promise<TaarufCard[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data - replace with actual database queries
  return [
    {
      id: "taaruf-001",
      pasanganKode: ["RM001", "RF002"],
      stage: "Zoom 1",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    },
    {
      id: "taaruf-002",
      pasanganKode: ["RM003", "RF004"],
      stage: "Screening",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    },
    {
      id: "taaruf-003",
      pasanganKode: ["RM005", "RF006"],
      stage: "Pengajuan",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1.25 hours ago
    },
    {
      id: "taaruf-004",
      pasanganKode: ["RM007", "RF008"],
      stage: "Keputusan",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "taaruf-005",
      pasanganKode: ["RM009", "RF010"],
      stage: "Selesai",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
  ];
}
