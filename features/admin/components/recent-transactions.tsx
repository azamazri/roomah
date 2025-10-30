import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLatestTransactions } from "@/features/admin/server/dashboard";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export async function RecentTransactions() {
  const transactions = await getLatestTransactions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Transaksi Terbaru</span>
          <Badge variant="info" className="text-xs">
            {transactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">Belum ada transaksi hari ini</div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    Rp {transaction.amount.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {transaction.user?.full_name || "Unknown"}
                    {transaction.created_at && (
                      <>
                        {" • "}
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    transaction.status === "settlement"
                      ? "success"
                      : transaction.status === "pending"
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs shrink-0 ml-2"
                >
                  {transaction.status === "settlement"
                    ? "Berhasil"
                    : transaction.status === "pending"
                    ? "Pending"
                    : "Gagal"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
