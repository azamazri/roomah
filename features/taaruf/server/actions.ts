"use server";

import { InboundItem, OutboundItem, ActiveItem } from "../types";
import { getUser } from "@/features/auth/lib/session";
import { getCandidateById } from "@/features/candidates/server/list";
import { deductKoin } from "@/features/koin/server/actions";

// Mock storage
const mockInboundStorage = new Map<string, InboundItem[]>();
const mockOutboundStorage = new Map<string, OutboundItem[]>();
const mockActiveStorage = new Map<string, ActiveItem[]>();

// Mock data untuk testing
const mockInboundData: InboundItem[] = [
  {
    id: "inb1",
    kodeKandidat: "AKHWAT00001",
    waktuPengajuan: "2024-01-15T10:30:00Z",
    status: "pending",
    candidateId: "c1",
  },
  {
    id: "inb2",
    kodeKandidat: "AKHWAT00002",
    waktuPengajuan: "2024-01-14T14:20:00Z",
    status: "pending",
    candidateId: "c3",
  },
];

const mockOutboundData: OutboundItem[] = [
  {
    id: "out1",
    kodeKandidat: "AKHWAT00003",
    waktuPengajuan: "2024-01-13T09:15:00Z",
    status: "pending",
    candidateId: "c5",
  },
];

// Initialize mock data
mockInboundStorage.set("user123", mockInboundData);
mockOutboundStorage.set("user123", mockOutboundData);
mockActiveStorage.set("user123", []);

export async function getInboundTaaruf(): Promise<InboundItem[]> {
  const user = await getUser();
  return mockInboundStorage.get(user.id) || [];
}

export async function getOutboundTaaruf(): Promise<OutboundItem[]> {
  const user = await getUser();
  const outbound = mockOutboundStorage.get(user.id) || [];

  // Filter out rejected items that should be auto-deleted
  const filtered = outbound.filter((item) => {
    if (item.status === "rejected" && item.autoDeleteAt) {
      return new Date() < new Date(item.autoDeleteAt);
    }
    return true;
  });

  // Update storage if items were filtered
  if (filtered.length !== outbound.length) {
    mockOutboundStorage.set(user.id, filtered);
  }

  return filtered;
}

export async function getActiveTaaruf(): Promise<ActiveItem[]> {
  const user = await getUser();
  return mockActiveStorage.get(user.id) || [];
}

export async function acceptTaaruf(inboundId: string) {
  const user = await getUser();

  try {
    const inboundItems = mockInboundStorage.get(user.id) || [];
    const inboundItem = inboundItems.find((item) => item.id === inboundId);

    if (!inboundItem) {
      return { success: false, error: "Taaruf request not found" };
    }

    // Move to active
    const activeItems = mockActiveStorage.get(user.id) || [];
    const newActiveItem: ActiveItem = {
      id: `active_${Date.now()}`,
      kodeTaaruf: `TAARUF${String(activeItems.length + 1).padStart(5, "0")}`,
      kodeKandidat: inboundItem.kodeKandidat,
      waktuMulai: new Date().toISOString(),
      status: "active",
      candidateId: inboundItem.candidateId,
    };

    activeItems.push(newActiveItem);
    mockActiveStorage.set(user.id, activeItems);

    // Remove from inbound
    const updatedInbound = inboundItems.filter((item) => item.id !== inboundId);
    mockInboundStorage.set(user.id, updatedInbound);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to accept taaruf" };
  }
}

export async function rejectTaaruf(inboundId: string) {
  const user = await getUser();

  try {
    const inboundItems = mockInboundStorage.get(user.id) || [];
    const updatedInbound = inboundItems.filter((item) => item.id !== inboundId);
    mockInboundStorage.set(user.id, updatedInbound);

    // Set outbound status to rejected with auto-delete timer
    // In real implementation, this would update the sender's outbound item
    // For now, we simulate this by updating mock data
    const mockSenderId = "sender123"; // In real app, get from inbound item
    const senderOutbound = mockOutboundStorage.get(mockSenderId) || [];
    const updatedSenderOutbound = senderOutbound.map((item) => {
      if (item.candidateId === user.id) {
        // Match target
        const autoDeleteAt = new Date();
        autoDeleteAt.setHours(autoDeleteAt.getHours() + 24);
        return {
          ...item,
          status: "rejected" as const,
          autoDeleteAt: autoDeleteAt.toISOString(),
        };
      }
      return item;
    });
    mockOutboundStorage.set(mockSenderId, updatedSenderOutbound);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reject taaruf" };
  }
}

export async function ajukanTaaruf(candidateId: string) {
  const user = await getUser();

  try {
    // WAJIB: memeriksa user.statusCv === "approve"
    if (user.statusCv !== "approve") {
      return { success: false, error: "CV_NOT_APPROVED" };
    }

    // WAJIB: memeriksa saldo koin >= 5
    if (user.saldoKoin < 5) {
      return { success: false, error: "INSUFFICIENT_COINS" };
    }

    // WAJIB: memeriksa tidak ada ta'aruf aktif
    if (user.hasActiveTaaruf) {
      return { success: false, error: "ACTIVE_TAARUF_EXISTS" };
    }

    // Get candidate info
    const candidate = await getCandidateById(candidateId);
    if (!candidate) {
      return { success: false, error: "CANDIDATE_NOT_FOUND" };
    }

    // WAJIB: mengurangi koin 5 via deductKoin(5)
    const deductResult = await deductKoin(5);
    if (!deductResult.success) {
      return { success: false, error: "INSUFFICIENT_COINS" };
    }

    // Create outbound entry
    const outboundItems = mockOutboundStorage.get(user.id) || [];
    const newOutboundItem: OutboundItem = {
      id: `out_${Date.now()}`,
      kodeKandidat: candidate.kodeKandidat,
      waktuPengajuan: new Date().toISOString(),
      status: "pending",
      candidateId: candidateId,
    };

    outboundItems.push(newOutboundItem);
    mockOutboundStorage.set(user.id, outboundItems);

    // Create inbound entry for target candidate
    const targetInbound = mockInboundStorage.get(candidateId) || [];
    const newInboundItem: InboundItem = {
      id: `inb_${Date.now()}`,
      kodeKandidat: `USER_${user.id}`, // In real app, get user's kode kandidat
      waktuPengajuan: new Date().toISOString(),
      status: "pending",
      candidateId: user.id,
    };

    targetInbound.push(newInboundItem);
    mockInboundStorage.set(candidateId, targetInbound);

    return { success: true };
  } catch (error) {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
