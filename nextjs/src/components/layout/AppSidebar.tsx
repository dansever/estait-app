"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  X,
  Building,
  Component,
  ChevronDown,
  Settings,
  Home,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { FaMagic } from "react-icons/fa";
import type { PropertyRow } from "@/lib/enrichedPropertyType";

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
  { name: "Dashboard", href: "/", icon: Home, description: "Overview" },
  {
    name: "Properties",
    href: "/properties",
    icon: Building,
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
  productName,
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

      {/* Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-30 lg:translate-x-0 flex flex-col overflow-hidden"
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b dark:border-gray-800">
          <span className="text-xl font-semibold text-primary-600 dark:text-primary-400 font-heading">
            {productName || "Estait"}
          </span>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 px-2 space-y-1">
            {sidebarTabs.map((item) => {
              if (item.name === "Properties") {
                const isPropertiesActive = pathname.startsWith("/properties");
                return (
                  <Collapsible
                    key={item.name}
                    open={propertiesExpanded}
                    onOpenChange={setPropertiesExpanded}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="w-full">
                        <div
                          className={`flex w-full items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
                            isPropertiesActive
                              ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          }`}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 ${
                              isPropertiesActive
                                ? "text-primary-500 dark:text-primary-400"
                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                            }`}
                          />
                          <Link href="/properties" className="flex-1">
                            Properties
                          </Link>
                          <motion.div
                            className="ml-2"
                            animate={{ rotate: propertiesExpanded ? 90 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPropertiesExpanded(!propertiesExpanded);
                            }}
                          >
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-white dark:bg-gray-900 rounded-md my-1 mx-2 overflow-hidden"
                      >
                        <div className="py-1">
                          {properties.length > 0 ? (
                            properties.map((property) => (
                              <Link
                                key={property.id}
                                href={`/properties/${property.id}`}
                                className={`block text-sm px-2 py-1.5 rounded-md pl-8 ${
                                  pathname === `/properties/${property.id}`
                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                }`}
                              >
                                {property.title}
                              </Link>
                            ))
                          ) : (
                            <span className="block text-sm text-gray-400 dark:text-gray-500 px-2 py-1 pl-8">
                              No properties
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Regular sidebar items
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
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
      </motion.div>
    </>
  );
}
