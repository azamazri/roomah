import { revalidateTag } from "next/cache";
import type { TaarufCard, TaarufStage } from "../types";

type KanbanData = Record<TaarufStage, TaarufCard[]>;

const STAGES: TaarufStage[] = [
  "Pengajuan",
  "Screening",
  "Zoom 1",
  "Zoom 2",
  "Keputusan",
  "Selesai",
];

export async function getTaarufByStage(): Promise<KanbanData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Mock data - replace with actual database queries
  const mockData: TaarufCard[] = [
    {
      id: "taaruf-001",
      pasanganKode: ["RM001", "RF002"],
      stage: "Pengajuan",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    },
    {
      id: "taaruf-002",
      pasanganKode: ["RM003", "RF004"],
      stage: "Pengajuan",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    },
    {
      id: "taaruf-003",
      pasanganKode: ["RM005", "RF006"],
      stage: "Screening",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1.25 hours ago
    },
    {
      id: "taaruf-004",
      pasanganKode: ["RM007", "RF008"],
      stage: "Screening",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: "taaruf-005",
      pasanganKode: ["RM009", "RF010"],
      stage: "Zoom 1",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    },
    {
      id: "taaruf-006",
      pasanganKode: ["RM011", "RF012"],
      stage: "Zoom 2",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    },
    {
      id: "taaruf-007",
      pasanganKode: ["RM013", "RF014"],
      stage: "Keputusan",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    },
    {
      id: "taaruf-008",
      pasanganKode: ["RM015", "RF016"],
      stage: "Selesai",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: "taaruf-009",
      pasanganKode: ["RM017", "RF018"],
      stage: "Selesai",
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
  ];

  // Group by stage
  const groupedData: KanbanData = STAGES.reduce((acc, stage) => {
    acc[stage] = mockData.filter((item) => item.stage === stage);
    return acc;
  }, {} as KanbanData);

  return groupedData;
}

export async function updateTaarufStage(
  taarufId: string,
  newStage: TaarufStage
): Promise<void> {
  // TODO: Implement actual database update

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Validate stage transition
  const validStages = STAGES;
  if (!validStages.includes(newStage)) {
    throw new Error(`Invalid stage: ${newStage}`);
  }

  // Mock: Update taaruf stage in database
  console.log(`Updating taaruf ${taarufId} to stage ${newStage}`);

  // Update user-facing ta'aruf status
  // This would update the status shown to users in their ta'aruf dashboard
  await updateUserTaarufStatus(taarufId, newStage);

  // Revalidate related cache tags
  revalidateTag("taaruf-kanban");
  revalidateTag("dashboard-kpi");
  revalidateTag(`taaruf-${taarufId}`);
}

async function updateUserTaarufStatus(
  taarufId: string,
  stage: TaarufStage
): Promise<void> {
  // TODO: Update user-facing status based on stage
  // This affects what users see in their ta'aruf dashboard

  const userStatusMap = {
    Pengajuan: "pending_admin_review",
    Screening: "under_review",
    "Zoom 1": "interview_scheduled_1",
    "Zoom 2": "interview_scheduled_2",
    Keputusan: "pending_decision",
    Selesai: "completed",
  };

  const userStatus = userStatusMap[stage];
  console.log(`Updating user status for taaruf ${taarufId} to ${userStatus}`);
}
