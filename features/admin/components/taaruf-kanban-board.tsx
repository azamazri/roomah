"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, RefreshCw, Clock, Users, Zap, Video, Calendar as CalendarIcon } from "lucide-react";
import { useTaarufKanban } from "../hooks/use-taaruf-kanban";
import { toast } from "@/lib/toast";
import type { TaarufStage, TaarufCard } from "../types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import React from "react";
import { KanbanSkeleton } from "./kanban-skeleton";
import { TaarufDetailModal } from "./taaruf-detail-modal";
import { ZoomScheduleModal } from "./zoom-schedule-modal";

const STAGES: TaarufStage[] = [
  "Pengajuan",
  "Zoom 1",
  "Zoom 2",
  "Khitbah",
  "Selesai",
];

const STAGE_CONFIG = {
  Pengajuan: {
    icon: Heart,
    color: "default",
    description: "Ta'aruf baru diajukan",
  },
  "Zoom 1": {
    icon: Video,
    color: "info",
    description: "Pertemuan virtual pertama",
  },
  "Zoom 2": {
    icon: Video,
    color: "info",
    description: "Pertemuan virtual kedua",
  },
  Khitbah: {
    icon: Heart,
    color: "success",
    description: "Proses khitbah",
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
  const [selectedTaaruf, setSelectedTaaruf] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomModalConfig, setZoomModalConfig] = useState<{
    taarufId: string | number;
    stage: "Zoom 1" | "Zoom 2";
  } | null>(null);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (result: unknown) => {
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

    if (!data) return;

    // Find card in ALL stages (in case of race condition)
    let dragged: TaarufCard | undefined;
    let actualSourceStage = sourceStage;

    // First try source stage
    dragged = data[sourceStage]?.find((x) => String(x.id) === String(draggableId));

    // If not found, search all stages (race condition - card already moved)
    if (!dragged) {
      for (const stage of STAGES) {
        const found = data[stage]?.find((x) => String(x.id) === String(draggableId));
        if (found) {
          dragged = found;
          actualSourceStage = stage;
          console.log(`Card ${draggableId} found in ${stage} instead of ${sourceStage}`);
          break;
        }
      }
    }

    if (!dragged) {
      console.error("Dragged card not found in any stage:", draggableId);
      toast.error("Gagal menemukan card. Silakan refresh halaman.");
      mutate(); // Refresh data
      return;
    }

    // If card already in destination stage, just refresh
    if (actualSourceStage === destStage) {
      console.log("Card already in destination stage, skipping");
      return;
    }

    const optimisticData = { ...data };
    // Remove from actual source stage (where card currently is)
    optimisticData[actualSourceStage] = optimisticData[actualSourceStage].filter(
      (x) => String(x.id) !== String(draggableId)
    );
    // Add to destination stage
    optimisticData[destStage] = [
      ...optimisticData[destStage],
      {
        ...dragged,
        stage: destStage,
        lastUpdate: new Date().toISOString(),
      },
    ];

    try {
      // Update UI optimistically
      await mutate(
        async () => {
          // Call API
          const res = await fetch(`/api/admin/taaruf/${draggableId}/stage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newStage: destStage }),
          });
          
          if (!res.ok) {
            const error = await res.json();
            console.error("API Error:", error);
            throw new Error(error.error || "Update stage failed");
          }

          // Return optimistic data (don't revalidate immediately)
          return optimisticData;
        },
        {
          optimisticData,
          rollbackOnError: true,
          revalidate: false, // Don't revalidate immediately to prevent race condition
        }
      );

      toast.success(`Ta'aruf berhasil dipindah ke ${destStage}`);
    } catch (error) {
      console.error("Drag & drop error:", error);
      toast.error("Gagal memindah Ta'aruf. Silakan coba lagi.");
      // SWR will automatically rollback to previous data
    }
  };

  const refreshData = () => {
    mutate();
    toast.info("Data diperbarui");
  };

  const handleCardClick = (card: TaarufCard) => {
    setSelectedTaaruf(card);
    setShowDetailModal(true);
  };

  const handleScheduleClick = (taarufId: string | number, stage: "Zoom 1" | "Zoom 2") => {
    setZoomModalConfig({ taarufId, stage });
    setShowZoomModal(true);
  };

  const handleZoomScheduled = () => {
    mutate(); // Refresh data
    setShowZoomModal(false);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            Gagal memuat data Ta'aruf. Silakan coba lagi.
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
      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const count = data[stage]?.length || 0;
          const config = STAGE_CONFIG[stage];

          return (
            <Card key={stage} className="text-center hover:shadow-md transition-shadow border-l-4" style={{
              borderLeftColor: 
                config.color === "success" ? "hsl(var(--success))" :
                config.color === "warning" ? "hsl(var(--warning))" :
                config.color === "info" ? "hsl(var(--info))" :
                "hsl(var(--muted))"
            }}>
              <div className="p-6">
                <div className="flex flex-col items-center justify-center gap-2 min-h-[60px]">
                  <div className="text-3xl font-bold tracking-tight">{count}</div>
                  <div className="text-xs font-medium text-muted-foreground">{stage}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
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
                    <Badge variant={config.color} className="ml-auto">
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
                            draggableId={String(card.id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TaarufCard
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                card={card}
                                isDragging={snapshot.isDragging}
                                onCardClick={handleCardClick}
                                onScheduleClick={handleScheduleClick}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {cards.length === 0 && !isDragging && (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="text-sm">
                              Belum ada Ta'aruf
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

      {/* Modals */}
      <TaarufDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        taaruf={selectedTaaruf}
      />

      {zoomModalConfig && (
        <ZoomScheduleModal
          open={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          taarufId={zoomModalConfig.taarufId}
          stage={zoomModalConfig.stage}
          onScheduled={handleZoomScheduled}
        />
      )}
    </div>
  );
}

interface TaarufCardProps {
  card: TaarufCard;
  isDragging: boolean;
  onCardClick?: (card: TaarufCard) => void;
  onScheduleClick?: (taarufId: string | number, stage: "Zoom 1" | "Zoom 2") => void;
}

const TaarufCard = React.forwardRef<HTMLDivElement, TaarufCardProps & Record<string, unknown>>(
  ({ card, isDragging, onCardClick, onScheduleClick, ...props }, ref) => {
    const handleCardClick = (e: React.MouseEvent) => {
      // Prevent drag when clicking buttons
      if ((e.target as HTMLElement).closest("button")) {
        e.stopPropagation();
        return;
      }
      // Open detail modal
      if (onCardClick) {
        onCardClick(card);
      }
    };

    return (
      <div
        ref={ref}
        {...props}
        className={`rounded-xl border bg-card transition-all cursor-pointer ${
          isDragging
            ? "shadow-lg scale-105 opacity-90"
            : "hover:shadow-md hover:border-primary/30"
        }`}
        onClick={handleCardClick}
      >
        <div className="p-4 space-y-3">
          {/* Status Badge */}
          <div className="flex justify-center px-2">
            <Badge 
              variant={
                card.status === "ACCEPTED" ? "success" : 
                card.status === "PENDING" ? "warning" : 
                "default"
              } 
              className="text-xs px-3"
            >
              {card.status === "ACCEPTED" ? "Diterima" : 
               card.status === "PENDING" ? "Menunggu" : 
               card.status}
            </Badge>
          </div>

          {/* Avatars Horizontal with Heart */}
          <div className="flex items-center justify-center gap-3 py-2 px-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {card.pasanganKode[0]?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            
            <Heart className="h-4 w-4 text-primary fill-primary/20" />
            
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary/50 text-secondary-foreground font-semibold text-sm">
                {card.pasanganKode[1]?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t mx-2">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(card.lastUpdate), {
              addSuffix: true,
              locale: id,
            })}
          </div>

          {/* Zoom Schedule Button */}
          {(card.stage === "Zoom 1" || card.stage === "Zoom 2") && (
            <div className="px-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onScheduleClick) {
                    onScheduleClick(card.id, card.stage as "Zoom 1" | "Zoom 2");
                  }
                }}
              >
                <Video className="h-3 w-3" />
                Jadwalkan
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
TaarufCard.displayName = "TaarufCard";
