"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CvPreview } from "./cv-preview";
import { CvForm } from "./cv-form";

export function CvTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "edit") {
      setActiveTab("edit");
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "edit") {
      params.set("tab", "edit");
    } else {
      params.delete("tab");
    }

    const queryString = params.toString();
    router.push(`/cv-saya${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => handleTabChange("preview")}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => handleTabChange("edit")}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Buat/Edit CV
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === "preview" ? (
          <CvPreview onEditClick={() => handleTabChange("edit")} />
        ) : (
          <CvForm />
        )}
      </div>
    </div>
  );
}
