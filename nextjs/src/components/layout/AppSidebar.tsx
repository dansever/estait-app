"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useGlobal } from "@/lib/context/GlobalContext";
import type { PropertyRow } from "@/lib/enrichedPropertyType";
import { createSPASassClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Building,
  ChevronDown,
  ChevronRight,
  Component,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMagic } from "react-icons/fa";

const sidebarTabs = [
  { name: "AI Search", href: "/ai-search", icon: FaMagic },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Components", href: "/z-components", icon: Component },
];

export default function AppSidebar() {
  const { user } = useGlobal();
  const pathname = usePathname();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const isDashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

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

  return (
    <Sidebar
      className="!top-[var(--navbar-height)] bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black"
      collapsible="icon"
    >
      <SidebarContent>
        {/* Main Navigation with Properties Sub-menu */}
        <SidebarGroup>
          <SidebarMenu>
            {/* Dashboard with Properties Submenu */}
            <SidebarMenuItem>
              <Collapsible
                open={isPropertiesOpen}
                onOpenChange={setIsPropertiesOpen}
                className="w-full"
              >
                <div className="flex w-full">
                  <Link href="/dashboard">
                    <SidebarMenuButton
                      isActive={isDashboardActive}
                      tooltip="My Dashboard"
                      className={cn(
                        "flex-grow transition-all duration-200",
                        isDashboardActive &&
                          "bg-primary-100 text-primary font-medium"
                      )}
                    >
                      <Home
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isDashboardActive && "text-primary"
                        )}
                      />
                      <span>My Dashboard</span>
                    </SidebarMenuButton>
                  </Link>

                  <CollapsibleTrigger asChild>
                    <button className="mr-2 p-2 text-gray-500 hover:text-primary focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors group-data-[collapsible=icon]:hidden">
                      {isPropertiesOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                </div>

                {properties.length > 0 && (
                  <CollapsibleContent className="transition-all duration-300 ease-in-out">
                    <SidebarMenuSub className="border-l-primary/30 ml-2">
                      {properties.map((property) => {
                        const isActive =
                          pathname === `/dashboard/${property.id}`;
                        return (
                          <SidebarMenuSubItem key={property.id}>
                            <Link href={`/dashboard/${property.id}`}>
                              <SidebarMenuSubButton
                                isActive={isActive}
                                title={property.title}
                                className={cn(
                                  "flex-grow transition-all duration-200",
                                  isActive &&
                                    "bg-primary-100 text-primary font-medium border-l-2 border-primary"
                                )}
                              >
                                <Building
                                  className={cn(
                                    "mr-2 h-4 w-4 transition-colors",
                                    isActive && "text-primary"
                                  )}
                                />
                                <span>{property.title}</span>
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarMenuItem>

            {/* Other sidebar tabs */}
            {sidebarTabs.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      title={item.name}
                      className={cn(
                        "transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive &&
                          "bg-primary-100 text-primary font-medium border-l-2 border-primary"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive && "text-primary"
                        )}
                      />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 py-2 px-4 text-xs text-gray-500">
        <div className="flex items-center justify-center">
          <span className="opacity-70">Estait App</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
