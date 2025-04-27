"use client";

import { useState, useEffect } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import type { PropertyRow } from "@/lib/enrichedPropertyType";
import AppNavBar from "./layout/AppNavBar";
import AppSidebar from "./layout/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const { user } = useGlobal();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) return;
      try {
        const client = await createSPASassClient();
        const fetchedProperties = await client.getPropertiesByUser(user.id);
        const sortedProperties = fetchedProperties.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setProperties(sortedProperties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, [user?.id]);

  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <AppNavBar
        user={user}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Sidebar (fixed to the side) */}
      <AppSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        productName={productName}
        properties={properties}
      />

      {/* Main Content */}
      <div
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-[280px]" : "lg:ml-0"
        }`}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
