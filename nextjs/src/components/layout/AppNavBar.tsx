"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Add this import at the top
import Link from "next/link";
import { Settings, LogOut, Menu } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import SearchBar, { Action } from "./SearchBar";

interface AppNavBarProps {
  user: any;
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

// Default search actions
const defaultActions: Action[] = [
  {
    id: "1",
    label: "Search properties",
    icon: <Settings className="h-4 w-4 text-blue-500" />,
    description: "Find listings",
    short: "⌘K",
    end: "Search",
    link: "/properties",
  },
  {
    id: "2",
    label: "Add new property",
    icon: <Settings className="h-4 w-4 text-orange-500" />,
    description: "Create listing",
    short: "⌘N",
    end: "Action",
    link: "/properties/add",
  },
  {
    id: "3",
    label: "View settings",
    icon: <Settings className="h-4 w-4 text-purple-500" />,
    description: "Preferences",
    short: "",
    end: "Navigate",
    link: "/settings",
  },
  {
    id: "4",
    label: "AI property search",
    icon: <Settings className="h-4 w-4 text-green-500" />,
    description: "Smart search",
    short: "",
    end: "Assistant",
    link: "/ai-search",
  },
];

export default function AppNavBar({
  user,
  toggleSidebar,
  isSidebarOpen = false,
}: AppNavBarProps) {
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter(); // initialize Next.js router

  // Handle user dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Handle search keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInputRef]);

  const handleLogout = async () => {
    try {
      const client = await createSPASassClient();
      await client.logout();
      router.push("/"); // ✅ After successful logout, go to "/"
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out">
      <div className="h-16 flex items-center justify-between px-4">
        {/* Menu toggle button for mobile */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* App logo/name */}
        <Link
          href="/properties"
          className="flex items-center space-x-2 text-primary-600 font-display text-lg font-semibold hover:text-primary-700 transition-colors"
        >
          <span>Estait</span>
        </Link>

        {/* Left spacer on desktop, hidden on mobile */}
        <div className="hidden lg:block"></div>

        {/* Centered search bar container */}
        <div className="flex-1 flex justify-center items-center max-w-2xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            inputRef={searchInputRef}
            actions={defaultActions}
            className="w-full"
          />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            aria-expanded={isUserDropdownOpen}
            tabIndex={0}
            onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <span className="text-primary-700 font-medium text-sm">
                  {user ? getInitials(user.email) : "??"}
                </span>
              )}
            </div>
          </button>

          {isUserDropdownOpen && (
            <div
              ref={userDropdownRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
            >
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
