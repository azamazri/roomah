import type { AccountRow, AccountDetail } from "../types";
import { PAGINATION_SIZE } from "../constants";

interface AccountListResponse {
  items: AccountRow[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listAccounts(
  page: number = 1,
  query: string = ""
): Promise<AccountListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - replace with actual database queries
  const mockData: AccountRow[] = [
    {
      userId: "user-001",
      email: "ahmad.rahman@email.com",
      nama: "Ahmad Rahman",
      gender: "M",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      statusCv: "approve",
      coinBalance: 15,
    },
    {
      userId: "user-002",
      email: "siti.aisyah@email.com",
      nama: "Siti Aisyah",
      gender: "F",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      statusCv: "review",
      coinBalance: 10,
    },
    {
      userId: "user-003",
      email: "muhammad.faisal@email.com",
      nama: "Muhammad Faisal",
      gender: "M",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      statusCv: "revisi",
      coinBalance: 5,
    },
    {
      userId: "user-004",
      email: "fatimah.azzahra@email.com",
      nama: "Fatimah Azzahra",
      gender: "F",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      statusCv: "approve",
      coinBalance: 25,
    },
    {
      userId: "user-005",
      email: "abdullah.ibrahim@email.com",
      nama: "Abdullah Ibrahim",
      gender: "M",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
      statusCv: "review",
      coinBalance: 0,
    },
    {
      userId: "user-006",
      email: "khadijah.ummu@email.com",
      nama: "Khadijah Ummu Salamah",
      gender: "F",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      statusCv: "approve",
      coinBalance: 30,
    },
  ];

  // Filter by query (search nama atau email)
  const filtered = query
    ? mockData.filter(
        (item) =>
          item.nama.toLowerCase().includes(query.toLowerCase()) ||
          item.email.toLowerCase().includes(query.toLowerCase())
      )
    : mockData;

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

export async function getAccountDetail(userId: string): Promise<AccountDetail> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Get basic account info first
  const accounts = await listAccounts(1, "");
  const account = accounts.items.find((acc) => acc.userId === userId);

  if (!account) {
    throw new Error("Account not found");
  }

  // Mock activities - replace with actual database query
  const mockActivities = {
    "user-001": [
      {
        type: "taaruf_ajukan" as const,
        id: "taaruf-req-001",
        at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        targetKode: "RF002",
      },
      {
        type: "coin_topup" as const,
        id: "topup-001",
        at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        amount: 50000,
        provider: "midtrans" as const,
      },
      {
        type: "cv_update" as const,
        at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ],
    "user-002": [
      {
        type: "cv_update" as const,
        at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      },
      {
        type: "coin_topup" as const,
        id: "topup-002",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        amount: 25000,
        provider: "midtrans" as const,
      },
    ],
    "user-004": [
      {
        type: "taaruf_ajukan" as const,
        id: "taaruf-req-002",
        at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        targetKode: "RM005",
      },
      {
        type: "coin_topup" as const,
        id: "topup-003",
        at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        amount: 100000,
        provider: "midtrans" as const,
      },
      {
        type: "cv_update" as const,
        at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ],
  };

  const activities =
    mockActivities[userId as keyof typeof mockActivities] || [];

  return {
    ...account,
    activities: activities.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    ),
  };
}
