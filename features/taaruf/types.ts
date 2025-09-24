export interface InboundItem {
  id: string;
  kodeKandidat: string;
  waktuPengajuan: string;
  status: "pending" | "accepted" | "rejected";
  candidateId: string;
}

export interface OutboundItem {
  id: string;
  kodeKandidat: string;
  waktuPengajuan: string;
  status: "pending" | "accepted" | "rejected";
  candidateId: string;
  autoDeleteAt?: string; // For rejected items, auto delete after 24h
}

export interface ActiveItem {
  id: string;
  kodeTaaruf: string;
  kodeKandidat: string;
  waktuMulai: string;
  status: "active";
  candidateId: string;
}
