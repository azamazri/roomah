import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLatestTaaruf } from "@/features/admin/server/dashboard";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Heart } from "lucide-react";

const stageColors = {
  Pengajuan: "default",
  Screening: "warning",
  "Zoom 1": "info",
  "Zoom 2": "info",
  Keputusan: "warning",
  Selesai: "success",
} as const;

export async function RecentTaaruf() {
  const taarufs = await getLatestTaaruf();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>Ta'aruf Terbaru</span>
          <Badge variant="info" className="text-xs">
            {taarufs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {taarufs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Belum ada Ta'aruf baru</div>
          </div>
        ) : (
          <div className="space-y-4">
            {taarufs.map((taaruf) => (
              <div
                key={taaruf.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="space-y-1 flex-1">
                  <div className="text-sm font-medium">
                    {taaruf.pasanganKode[0]} × {taaruf.pasanganKode[1]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(taaruf.lastUpdate), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </div>
                </div>
                <Badge variant={stageColors[taaruf.stage]} className="text-xs">
                  {taaruf.stage}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
