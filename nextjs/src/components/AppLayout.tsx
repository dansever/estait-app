"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import AppSidebar from "./layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const { user } = useGlobal();

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
      />

      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white shadow-sm px-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative ml-auto">
            <button
              aria-expanded={isUserDropdownOpen}
              tabIndex={0}
              onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">
                  {user ? getInitials(user.email) : "??"}
                </span>
              </div>
              <span>{user?.email || "Loading..."}</span>
              <ChevronDown className="h-4 w-4" />
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
