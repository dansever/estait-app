"use client";

import React, { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

export type TabItem = {
  id: string | number | boolean | null;
  label: string;
  icon?: React.ElementType;
  content: ReactNode;
};

type NavTabsProps = {
  tabs: TabItem[];
  defaultTabId?: string | number | boolean | null;
  className?: string;
  onChange?: (tabId: string | number | boolean | null) => void;
};

export function NavTabs({
  tabs,
  defaultTabId,
  className = "",
  onChange,
}: NavTabsProps) {
  const [activeTabId, setActiveTabId] = useState<
    string | number | boolean | null
  >(defaultTabId !== undefined ? defaultTabId : tabs[0]?.id ?? null);

  const handleTabClick = (tabId: string | number | boolean | null) => {
    setActiveTabId(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTabId)?.content;

  return (
    <div className={className}>
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <Button
              key={String(tab.id)}
              onClick={() => handleTabClick(tab.id)}
              size="sm"
              className={`transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-text-inverted)] hover:bg-[var(--color-primary)]"
                  : "bg-[var(--color-primary-100)] text-[var(--color-primary-800)] hover:bg-[var(--color-primary-200)]"
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
