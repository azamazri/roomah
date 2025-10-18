export type CvStatus = "approve" | "review" | "revisi";

export type AdminUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  scopes: string[];
};

export type AdminKpi = {
  totalUsers: number;
  activeTaaruf: number;
  approvedCV: number;
  pendingCV: number;
  coinTopupToday: number;
  revenueMTD: number;
  profitMTD: number;
};

export type CvQueueItem = {
  userId: string;
  nama: string;
  gender: "M" | "F";
  submittedAt: string;
  status: CvStatus;
};

export type CvReviewAction = {
  userId: string;
  decision: "approve" | "revisi";
  note?: string;
};

export type AccountRow = {
  userId: string;
  email: string;
  nama: string;
  gender: "M" | "F";
  createdAt: string;
  statusCv: CvStatus;
  coinBalance: number;
};

export type AccountDetail = AccountRow & {
  activities: Array<
    | { type: "taaruf_ajukan"; id: string; at: string; targetKode?: string }
    | {
        type: "coin_topup";
        id: string;
        at: string;
        amount: number;
        provider: "midtrans";
      }
    | { type: "cv_update"; at: string }
  >;
};

export type TaarufStage =
  | "Pengajuan"
  | "Screening"
  | "Zoom 1"
  | "Zoom 2"
  | "Keputusan"
  | "Selesai";

export type TaarufCard = {
  id: string;
  pasanganKode: [string, string];
  stage: TaarufStage;
  lastUpdate: string;
};

export type CoinRecord = {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "settlement" | "deny";
  provider: "midtrans";
  createdAt: string;
};

export type PostingItem = {
  id: string;
  userId: string;
  kodeKandidat?: string;
  platform: "tiktok" | "instagram" | "facebook" | "x";
  caption: string;
  mediaUrl?: string;
  status: "queued" | "posted" | "rejected";
  requestedAt: string;
};

export type PlatformSettings = {
  coinPriceIdrPerUnit: number;
  taarufMinCoins: number;
  admins: Array<{
    email: string;
    isAdmin: boolean;
    scopes: string[];
  }>;
};
