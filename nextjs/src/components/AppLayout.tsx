/**
 * File: AppLayout.tsx
 *
 * Responsibility:
 * Provides the main application layout structure with navigation and user controls
 *
 * Key features:
 * - Responsive sidebar navigation
 * - User profile dropdown with authentication options
 * - Theme toggling between light and dark modes
 * - Consistent layout for all application pages
 *
 * Components:
 * - AppLayout: Main layout wrapper for authenticated application pages
 */

"use client";
import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, LogOut, Key, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/lib/context/GlobalContext";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import SearchBar from "@/components/SearchBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user } = useGlobal();
  const { logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useGlobal();
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      const { success } = await logout();
      if (success) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChangePassword = () => {
    router.push("/app/settings");
  };

  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`min-h-screen ${
        resolvedTheme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <AppSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="lg:pl-64">
        {/* Topbar */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between h-16 ${
            resolvedTheme === "dark"
              ? "bg-gray-800 shadow-md"
              : "bg-white shadow-sm"
          } px-4`}
        >
          <SearchBar />
          <button
            onClick={toggleSidebar}
            className={`lg:hidden ${
              resolvedTheme === "dark"
                ? "text-gray-300 hover:text-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className={`mx-4 p-2 rounded-full ${
              resolvedTheme === "dark"
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              className={`flex items-center space-x-2 text-sm ${
                resolvedTheme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full ${
                  resolvedTheme === "dark" ? "bg-gray-700" : "bg-primary-100"
                } flex items-center justify-center`}
              >
                <span
                  className={`${
                    resolvedTheme === "dark"
                      ? "text-gray-100"
                      : "text-primary-700"
                  } font-medium`}
                >
                  {user ? getInitials(user.email) : "??"}
                </span>
              </div>
              <span>{user?.email || "Loading..."}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isUserDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`p-2 border-b ${
                    resolvedTheme === "dark"
                      ? "border-gray-700"
                      : "border-gray-100"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Signed in as
                  </p>
                  <p
                    className={`text-sm font-medium truncate ${
                      resolvedTheme === "dark"
                        ? "text-gray-100"
                        : "text-gray-900"
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleChangePassword();
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm ${
                      resolvedTheme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Key
                      className={`mr-3 h-4 w-4 ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    />
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm ${
                      resolvedTheme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <LogOut
                      className={`mr-3 h-4 w-4 ${
                        resolvedTheme === "dark"
                          ? "text-red-400"
                          : "text-red-400"
                      }`}
                    />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Main content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
