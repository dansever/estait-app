"use client";

import React, { ReactNode, useState, useMemo, useRef, useEffect } from "react";
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

  const tabRefs = useRef<Map<TabId, HTMLButtonElement | null>>(new Map());
  const underlineRef = useRef<HTMLDivElement>(null);

  const updateUnderline = () => {
    const current = tabRefs.current.get(activeTabId!);
    const underline = underlineRef.current;
    if (current && underline) {
      const { offsetLeft, offsetWidth } = current;
      underline.style.transform = `translateX(${offsetLeft}px)`;
      underline.style.width = `${offsetWidth}px`;
    }
  };

  useEffect(() => {
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeTabId, tabs]);

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
      <div className="relative mb-6 flex gap-2 flex-wrap border-b border-divider">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <Button
              key={String(tab.id)}
              ref={(el) => tabRefs.current.set(tab.id, el)}
              onClick={() => handleTabClick(tab.id)}
              size="sm"
              aria-selected={isActive}
              role="tab"
              className={`relative rounded-none px-6 py-3 text-base font-large transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              variant="ghost"
            >
              {tab.icon &&
                React.createElement(tab.icon, { className: "h-4 w-4 mr-2" })}
              {tab.label}
            </Button>
          );
        })}

        {/* Animated underline */}
        <div
          ref={underlineRef}
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
        />
      </div>

      <div className="tab-content">{activeTabContent}</div>
    </div>
  );
}
