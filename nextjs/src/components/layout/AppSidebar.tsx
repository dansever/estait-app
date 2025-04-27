"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Component, Settings, Home } from "lucide-react";
import { FaMagic } from "react-icons/fa";
import type { PropertyRow } from "@/lib/enrichedPropertyType";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type SidebarTab = {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
};

interface AppSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  productName?: string;
  properties?: PropertyRow[]; // Optional, can be empty
}

const sidebarTabs: SidebarTab[] = [
  {
    name: "My Dashboard",
    href: "/properties",
    icon: Home,
    description: "Manage listings",
  },
  {
    name: "AI Search",
    href: "/ai-search",
    icon: FaMagic,
    description: "Smart property search",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences",
  },
  {
    name: "Components",
    href: "/z-components",
    icon: Component,
    description: "UI Components",
  },
];

export default function AppSidebar({
  isOpen,
  toggleSidebar,
  properties = [],
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [propertiesExpanded, setPropertiesExpanded] = useState(() =>
    pathname.startsWith("/properties")
  );

  // Add hover tracking for dropdown
  const [isHovering, setIsHovering] = useState(false);

  // Auto-expand dropdown on hover
  useEffect(() => {
    if (isHovering) {
      setPropertiesExpanded(true);
    }
  }, [isHovering]);

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar - positioned below navbar with top padding */}
      <motion.div
        className={cn(
          "fixed top-20 left-6 z-30 flex flex-col",
          "w-[260px] h-[calc(100vh-6rem)]", // slightly smaller height
          "rounded-2xl bg-white/90",
          "border border-gray-50",
          "backdrop-blur-md",
          "transition-all duration-300 ease-in-out"
        )}
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "flex flex-col h-full",
            "rounded-xl overflow-hidden", // Rounded corners
            "bg-white dark:bg-gray-900",
            "border border-gray-200 dark:border-gray-800",
            "shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50" // Subtle shadow
          )}
        >
          <div className="flex items-center justify-end p-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <nav className="px-3 py-2 space-y-1">
              {sidebarTabs.map((item) => {
                // Regular sidebar items
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary-500 dark:text-primary-400"
                          : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {properties.length > 0 && (
              <div className="px-3 py-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 pl-3">
                  Properties
                </div>
                <div className="space-y-1">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className={cn(
                        "block text-sm px-3 py-2 rounded-lg",
                        pathname === `/properties/${property.id}`
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      )}
                    >
                      {property.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center">
                <FaMagic className="h-4 w-4 text-primary-500 dark:text-primary-400 mr-2" />
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  Pro Tip
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Press{" "}
                <kbd className="bg-white dark:bg-gray-700 px-1 rounded border shadow-sm dark:border-gray-600">
                  ⌘K
                </kbd>{" "}
                or{" "}
                <kbd className="bg-white dark:bg-gray-700 px-1 rounded border shadow-sm dark:border-gray-600">
                  /
                </kbd>{" "}
                to quickly search and navigate.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
