"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, Clock, Users, Zap } from "lucide-react";
import { useTaarufKanban } from "../hooks/use-taaruf-kanban";
import { toast } from "@/lib/toast";
import type { TaarufStage, TaarufCard } from "../types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import React from "react";
import { KanbanSkeleton } from "./kanban-skeleton";

const STAGES: TaarufStage[] = [
  "Pengajuan",
  "Screening",
  "Zoom 1",
  "Zoom 2",
  "Keputusan",
  "Selesai",
];

const STAGE_CONFIG = {
  Pengajuan: {
    icon: Heart,
    color: "default",
    description: "Ta&apos;aruf baru diajukan",
  },
  Screening: {
    icon: Users,
    color: "warning",
    description: "Tahap screening awal",
  },
  "Zoom 1": {
    icon: Zap,
    color: "info",
    description: "Pertemuan virtual pertama",
  },
  "Zoom 2": {
    icon: Zap,
    color: "info",
    description: "Pertemuan virtual kedua",
  },
  Keputusan: {
    icon: Clock,
    color: "warning",
    description: "Menunggu keputusan",
  },
  Selesai: {
    icon: Heart,
    color: "success",
    description: "Proses selesai",
  },
} as const;

export function TaarufKanbanBoard() {
  const { data, isLoading, error, mutate } = useTaarufKanban();
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);

    const { destination, source, draggableId } = result;

    // No destination or same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceStage = source.droppableId as TaarufStage;
    const destStage = destination.droppableId as TaarufStage;

    // Validate stage transition (must be linear forward)
    if (!isValidTransition(sourceStage, destStage)) {
      toast.error(
        "Transisi stage tidak valid. Hanya bisa maju secara berurutan."
      );
      return;
    }

    try {
      // Optimistic update
      await mutate(async () => {
        // panggil API
        const res = await fetch(`/api/admin/taaruf/${draggableId}/stage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStage: destStage }),
        });
        if (!res.ok) throw new Error("Update stage failed");

        if (!data) return data;

        const updated = { ...data };
        updated[sourceStage] = updated[sourceStage].filter(
          (x) => x.id !== draggableId
        );
        const dragged = data[sourceStage].find((x) => x.id === draggableId);
        if (dragged) {
          updated[destStage] = [
            ...updated[destStage],
            {
              ...dragged,
              stage: destStage,
              lastUpdate: new Date().toISOString(),
            },
          ];
        }
        return updated;
      });

      toast.success(`Ta&apos;aruf berhasil dipindah ke ${destStage}`);
    } catch (error) {
      toast.error("Gagal memindah Ta&apos;aruf. Silakan coba lagi.");
    }
  };

  const isValidTransition = (from: TaarufStage, to: TaarufStage): boolean => {
    const fromIndex = STAGES.indexOf(from);
    const toIndex = STAGES.indexOf(to);

    // Allow forward movement only (except Keputusan -> Selesai is special case)
    return (
      toIndex === fromIndex + 1 || (from === "Keputusan" && to === "Selesai")
    );
  };

  const refreshData = () => {
    mutate();
    toast.info("Data diperbarui");
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            Gagal memuat data Ta&apos;aruf. Silakan coba lagi.
          </div>
          <Button onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <KanbanSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const count = data[stage]?.length || 0;
          const config = STAGE_CONFIG[stage];
          const Icon = config.icon;

          return (
            <Card key={stage} className="text-center">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{stage}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
          {STAGES.map((stage) => {
            const config = STAGE_CONFIG[stage];
            const Icon = config.icon;
            const cards = data[stage] || [];

            return (
              <Card key={stage} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4" />
                    <span>{stage}</span>
                    <Badge variant={config.color as any} className="ml-auto">
                      {cards.length}
                    </Badge>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] p-2 rounded-md transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-primary/10 border-2 border-primary/20"
                            : "border-2 border-transparent"
                        }`}
                      >
                        {cards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TaarufCard
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                card={card}
                                isDragging={snapshot.isDragging}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {cards.length === 0 && !isDragging && (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="text-sm">
                              Belum ada Ta&apos;aruf
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

interface TaarufCardProps {
  card: TaarufCard;
  isDragging: boolean;
}

const TaarufCard = React.forwardRef<HTMLDivElement, TaarufCardProps & any>(
  ({ card, isDragging, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={`p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-all ${
          isDragging
            ? "shadow-lg rotate-2 scale-105 opacity-90"
            : "hover:shadow-md"
        }`}
      >
        <div className="space-y-2">
          {/* Pasangan Kode */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="default" className="text-xs">
              {card.pasanganKode[0]}
            </Badge>
            <Heart className="h-3 w-3 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {card.pasanganKode[1]}
            </Badge>
          </div>

          {/* Last Update */}
          <div className="text-xs text-muted-foreground text-center">
            {formatDistanceToNow(new Date(card.lastUpdate), {
              addSuffix: true,
              locale: id,
            })}
          </div>

          {/* ID untuk debug */}
          <div className="text-xs text-muted-foreground/50 text-center font-mono">
            {card.id.slice(-6)}
          </div>
        </div>
      </div>
    );
  }
);
TaarufCard.displayName = "TaarufCard";
