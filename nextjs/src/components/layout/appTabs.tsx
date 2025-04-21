"use client";

import React, { ReactNode, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

type TabId = string | number | boolean | null;

export type TabItem = {
  id: TabId;
  label: string;
  icon?: React.ElementType;
  content: ReactNode;
};

type AppTabsProps = {
  tabs: TabItem[];
  defaultTabId?: TabId;
  className?: string;
  onChange?: (tabId: TabId) => void;
};

export function AppTabs({
  tabs,
  defaultTabId,
  className = "",
  onChange,
}: AppTabsProps) {
  const [activeTabId, setActiveTabId] = useState<TabId>(
    defaultTabId ?? tabs[0]?.id ?? null
  );

  const handleTabClick = (tabId: TabId) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId)?.content,
    [activeTabId, tabs]
  );

  return (
    <div className={className}>
      <div className="mb-6 flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <Button
              key={String(tab.id)}
              onClick={() => handleTabClick(tab.id)}
              size="sm"
              aria-selected={isActive}
              role="tab"
              className={`rounded-md px-4 py-2 font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.icon &&
                React.createElement(tab.icon, { className: "h-4 w-4 mr-2" })}
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div className="tab-content">{activeTabContent}</div>
    </div>
  );
}
