"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  className?: string;
}

export function AdminTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Tidak ada data",
  emptyIcon: EmptyIcon,
  className,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse p-4 rounded-lg border">
            <div className="grid grid-cols-4 gap-4">
              {columns.map((_, colIndex) => (
                <div key={colIndex}>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-1"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        {EmptyIcon && (
          <EmptyIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        )}
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header - Hidden on mobile, shown on desktop */}
      <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
        {columns.map((column) => (
          <div key={column.key} className={column.className}>
            {column.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((item, index) => (
        <Card key={item.id || index} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn("space-y-1", column.className)}
              >
                {/* Mobile label */}
                <div className="md:hidden text-xs font-medium text-muted-foreground">
                  {column.label}
                </div>
                <div>
                  {column.render ? column.render(item) : item[column.key]}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
