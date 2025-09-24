import { Suspense } from "react";
import { TaarufKanbanBoard } from "@/features/admin/components/taaruf-kanban-board";
import { KanbanSkeleton } from "@/features/admin/components/kanban-skeleton";

export default function ProsesTaarufPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Proses Ta&apos;aruf</h1>
        <p className="text-muted-foreground">
          Kelola proses Ta&apos;aruf pasangan dengan sistem kanban drag & drop
        </p>
      </div>

      <Suspense fallback={<KanbanSkeleton />}>
        <TaarufKanbanBoard />
      </Suspense>
    </div>
  );
}
