import {
  Users,
  FileCheck,
  Clock,
  Heart,
  Coins,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { getKpiData } from "../server/dashboard";

export async function DashboardKpi() {
  const kpi = await getKpiData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Pengguna"
        value={kpi.totalUsers}
        icon={Users}
        description="Pengguna terdaftar"
      />

      <StatCard
        title="CV Disetujui"
        value={kpi.approvedCV}
        icon={FileCheck}
        description="Siap tampil di platform"
      />

      <StatCard
        title="CV Pending"
        value={kpi.pendingCV}
        icon={Clock}
        description="Menunggu verifikasi"
        className={kpi.pendingCV > 50 ? "ring-2 ring-warning/20" : ""}
      />

      <StatCard
        title="Ta'aruf Aktif"
        value={kpi.activeTaaruf}
        icon={Heart}
        description="Sedang berjalan"
      />

      <div className="md:col-span-2 lg:col-span-1">
        <StatCard
          title="Top Up Hari Ini"
          value={`Rp ${kpi.coinTopupToday.toLocaleString("id-ID")}`}
          icon={Coins}
          description="Total koin dibeli"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-1">
        <StatCard
          title="Revenue MTD"
          value={`Rp ${kpi.revenueMTD.toLocaleString("id-ID")}`}
          icon={TrendingUp}
          description="Pendapatan bulan ini"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-2">
        <StatCard
          title="Profit MTD"
          value={`Rp ${kpi.profitMTD.toLocaleString("id-ID")}`}
          icon={DollarSign}
          description="Keuntungan bersih bulan ini"
          trend={{
            value: 12.5,
            isPositive: true,
          }}
        />
      </div>
    </div>
  );
}
