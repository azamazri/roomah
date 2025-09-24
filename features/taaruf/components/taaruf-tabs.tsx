"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InboundList } from "./inbound-list";
import { OutboundList } from "./outbound-list";
import { ActiveList } from "./active-list";

type TabType = "inbound" | "outbound" | "active";

export function TaarufTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("inbound");

  const tabs = [
    { id: "inbound" as TabType, label: "CV Masuk", component: InboundList },
    { id: "outbound" as TabType, label: "CV Dikirim", component: OutboundList },
    { id: "active" as TabType, label: "Ta'aruf Aktif", component: ActiveList },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || InboundList;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="grid grid-cols-3 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        <ActiveComponent />
      </div>
    </div>
  );
}
