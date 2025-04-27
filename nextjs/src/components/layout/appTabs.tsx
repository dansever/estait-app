"use client";

import React, { ReactNode, useState, useRef, useEffect, useMemo } from "react";

type TabId = string | number | boolean | null;

export type TabItem = {
  id: TabId;
  label: string;
  icon?: React.ElementType;
  content: ReactNode;
  disabled?: boolean;
};

type AppTabsProps = {
  tabs: TabItem[];
  defaultTabId?: TabId;
  className?: string;
  onChange?: (tabId: TabId) => void;
  variant?: "underline" | "pills" | "bordered";
  size?: "sm" | "md" | "lg";
};

export function AppTabs({
  tabs,
  defaultTabId,
  className = "",
  onChange,
  variant = "underline",
  size = "md",
}: AppTabsProps) {
  const [activeTabId, setActiveTabId] = useState<TabId>(
    defaultTabId ?? tabs[0]?.id ?? null
  );

  const tabRefs = useRef<Map<TabId, HTMLButtonElement | null>>(new Map());
  const underlineRef = useRef<HTMLDivElement>(null);

  const activeTabContent = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId)?.content,
    [activeTabId, tabs]
  );

  const updateUnderline = () => {
    if (variant !== "underline") return;

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
  }, [activeTabId, tabs, variant]);

  const handleTabClick = (tabId: TabId, disabled?: boolean) => {
    if (disabled) return;
    if (tabId === activeTabId) return;

    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm py-1.5 px-3";
      case "lg":
        return "text-base py-3 px-6";
      case "md":
      default:
        return "text-sm py-2 px-4";
    }
  };

  const getTabListClasses = () => {
    switch (variant) {
      case "pills":
        return "flex gap-2 flex-wrap mb-6";
      case "bordered":
        return "flex flex-wrap mb-6 border-b border-gray-200";
      case "underline":
      default:
        return "relative flex gap-2 flex-wrap mb-6 border-b border-gray-200";
    }
  };

  const getTabClasses = (isActive: boolean, disabled?: boolean) => {
    const sizeClass = getSizeClasses();
    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

    switch (variant) {
      case "pills":
        return `${sizeClass} font-medium rounded-full transition-all duration-200 ${
          isActive
            ? "bg-primary-50 text-primary-600"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        } ${disabledClass}`;
      case "bordered":
        return `${sizeClass} font-medium border-b-2 -mb-px transition-all duration-200 ${
          isActive
            ? "text-primary-600 border-primary-600"
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
        } ${disabledClass}`;
      case "underline":
      default:
        return `${sizeClass} font-medium transition-all duration-200 ${
          isActive ? "text-primary-600" : "text-gray-600 hover:text-gray-900"
        } ${disabledClass}`;
    }
  };

  return (
    <div className={className}>
      <div className={getTabListClasses()}>
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={String(tab.id)}
              ref={(el) => tabRefs.current.set(tab.id, el)}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              role="tab"
              className={getTabClasses(isActive, tab.disabled)}
            >
              {tab.icon &&
                React.createElement(tab.icon, {
                  className: "h-4 w-4 mr-2 inline-block",
                })}
              {tab.label}
            </button>
          );
        })}

        {variant === "underline" && (
          <div
            ref={underlineRef}
            className="absolute bottom-0 h-0.5 bg-primary-600 transition-all duration-300 ease-in-out"
          />
        )}
      </div>

      <div className="relative min-h-[50px]">{activeTabContent}</div>
    </div>
  );
}
