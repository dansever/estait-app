"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building,
  Sparkles,
  BarChart2,
  Settings,
  X,
  Component,
} from "lucide-react";
import { MdSell } from "react-icons/md";
import { useGlobal } from "@/lib/context/GlobalContext";

export function AppSidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const pathname = usePathname();
  useGlobal();
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  const navigation = [
    { name: "Homepage", href: "/app", icon: Home },
    { name: "Properties", href: "/app/properties", icon: Building },
    { name: "AI Search", href: "/app/ai-search", icon: Sparkles },
    { name: "Analytics", href: "/app/analytics", icon: BarChart2 },
    { name: "Settings", href: "/app/settings", icon: Settings },
    { name: "My Listings", href: "/app/listings", icon: MdSell },
    { name: "Components", href: "/app/z-components", icon: Component },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <span className="text-xl font-semibold text-primary-600">
            {productName}
          </span>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? "text-primary-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
