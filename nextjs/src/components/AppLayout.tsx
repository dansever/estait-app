"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { BsStars } from "react-icons/bs";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import AppSidebar from "./layout/AppSidebar";
import { Settings } from "lucide-react";
import type { PropertyRow } from "@/lib/enrichedPropertyType";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useGlobal();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Add keyboard shortcut functionality (press / to focus)
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) return;
      try {
        const client = await createSPASassClient();
        const fetchedProperties = await client.getPropertiesByUser(user.id);
        const sortedProperties = fetchedProperties.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProperties(fetchedProperties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      const client = await createSPASassClient();
      await client.logout();
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

  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-100">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AppSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        productName={productName}
        properties={properties}
      />

      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Enhanced Search Bar */}
          <div className="relative flex-grow max-w-2xl mx-4">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <BsStars size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Ask anything... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="relative ml-auto">
            <button
              aria-expanded={isUserDropdownOpen}
              tabIndex={0}
              onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-primary-700 font-medium">
                    {user ? getInitials(user.email) : "??"}
                  </span>
                )}
              </div>
            </button>

            {isUserDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border"
              >
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-400" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4 text-red-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
