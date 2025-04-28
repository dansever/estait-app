"use client";

// src/app/app/layout.tsx
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { GlobalProvider } from "@/lib/context/GlobalContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppNavBar from "@/components/layout/AppNavBar";

// Client component to handle responsive layout
function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <AppNavBar />

      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div
        className={`pt-16 transition-all duration-300 ${
          isCollapsed
            ? "lg:ml-[3rem]" // When collapsed, sidebar is icon-only (3rem)
            : "lg:ml-[16rem]" // When expanded, full sidebar width
        }`}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Sidebar trigger in a more visible location */}
          <div className="mb-4 flex items-center">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

// Wrapper component for providers
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <SidebarProvider>
        <AppLayout children={children} />
      </SidebarProvider>
    </GlobalProvider>
  );
}
