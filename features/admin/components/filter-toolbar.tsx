"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, RefreshCw, Download, Calendar, X } from "lucide-react";
import { useState } from "react";

interface FilterToolbarProps {
  status: string;
  from: string;
  to: string;
  onFilterChange: (key: string, value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
}

export function FilterToolbar({
  status,
  from,
  to,
  onFilterChange,
  onRefresh,
  onExport,
  isRefreshing,
}: FilterToolbarProps) {
  const [showFilters, setShowFilters] = useState(status || from || to);

  const hasActiveFilters = status || from || to;

  const clearFilters = () => {
    onFilterChange("status", "");
    onFilterChange("from", "");
    onFilterChange("to", "");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Status Transaksi
              </label>
              <Select
                value={status}
                onChange={(e) => onFilterChange("status", e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="settlement">Berhasil</option>
                <option value="deny">Gagal</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tanggal Dari
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => onFilterChange("from", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Tanggal Sampai
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => onFilterChange("to", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
