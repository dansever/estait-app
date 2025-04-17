/**
 * File: listings/page.tsx
 *
 * Responsibility:
 * Displays property listings with pagination and filtering options
 *
 * Key features:
 * - Implements pagination for property listings
 * - Provides filtering by listing purpose and platforms
 * - Displays property cards with key information
 * - Offers AI-assisted listing creation
 *
 * Components:
 * - ListingsPage: Main page for viewing and managing property listings
 */

"use client";

import { useState, useEffect } from "react";
import { MdSell } from "react-icons/md";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGlobal } from "@/lib/context/GlobalContext";
import { usePagination } from "@/hooks/use-pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock data until we integrate with a real API
const MOCK_PROPERTIES = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  address: `${i + 100} ${
    ["Main St", "Oak Ave", "Park Rd", "Elm St", "Maple Dr"][i % 5]
  }, ${["New York", "Los Angeles", "Chicago", "Houston", "Miami"][i % 5]}`,
  description: "AI-generated listing ready to publish",
  status: ["Draft", "Published", "Under Review"][i % 3],
  type: i % 2 === 0 ? "rent" : "sell",
  platforms: [
    ...(i % 3 === 0 ? ["Zillow"] : []),
    ...(i % 4 === 0 ? ["Facebook Marketplace"] : []),
    ...(i % 5 === 0 ? ["Craigslist"] : []),
    ...(i % 7 === 0 ? ["Other"] : []),
  ],
}));

export default function ListingsPage() {
  const { resolvedTheme } = useGlobal();
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [filters, setFilters] = useState({
    purpose: "all",
    platforms: [] as string[],
  });

  // Apply filters to properties
  const filteredProperties = properties.filter((property) => {
    // Filter by purpose (rent/sell)
    if (filters.purpose !== "all" && property.type !== filters.purpose) {
      return false;
    }

    // Filter by platforms
    if (filters.platforms.length > 0) {
      // Only show properties that have at least one of the selected platforms
      if (
        !property.platforms.some((platform) =>
          filters.platforms.includes(platform)
        )
      ) {
        return false;
      }
    }

    return true;
  });

  // Use our pagination hook
  const pagination = usePagination({
    totalItems: filteredProperties.length,
    initialPageSize: 6,
  });

  // Get current page of properties
  const currentProperties = pagination.paginate(filteredProperties);

  // Handler for purpose radio buttons
  const handlePurposeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      purpose: value,
    }));
    pagination.goToPage(1); // Reset to first page when filter changes
  };

  // Handler for platform checkboxes
  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFilters((prev) => {
      const newPlatforms = checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter((p) => p !== platform);

      return {
        ...prev,
        platforms: newPlatforms,
      };
    });
    pagination.goToPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MdSell className="text-3xl text-primary" />
        <h1 className="text-2xl font-semibold">AI Listings</h1>
      </div>

      <p
        className={`${
          resolvedTheme === "dark" ? "text-gray-300" : "text-muted-foreground"
        } max-w-2xl`}
      >
        Let AI turn your property data into powerful, high-performing listings.
        We crunch your property details, market trends, and platform best
        practices to generate optimized content that attracts more views and
        applications.
      </p>

      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-800" : "bg-muted"
        } p-4 rounded-xl border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        } max-w-2xl`}
      >
        <p
          className={`text-sm ${
            resolvedTheme === "dark" ? "text-gray-300" : "text-muted-foreground"
          } italic`}
        >
          💡 Our AI considers location, amenities, market trends, and
          platform-specific keywords to make each listing stand out.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
        {/* Choose purpose */}
        <div>
          <Label className="mb-2 block">Listing Purpose</Label>
          <RadioGroup
            value={filters.purpose}
            onValueChange={handlePurposeChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="rent" />
              <Label htmlFor="rent">Rent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sell" id="sell" />
              <Label htmlFor="sell">Sell</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Choose platforms */}
        <div>
          <Label className="mb-2 block">List On</Label>
          <div className="space-y-2">
            {["Zillow", "Facebook Marketplace", "Craigslist", "Other"].map(
              (platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={filters.platforms.includes(platform)}
                    onCheckedChange={(checked) =>
                      handlePlatformChange(platform, checked === true)
                    }
                  />
                  <Label htmlFor={platform}>{platform}</Label>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Link href="/listings/create">
        <Button className="mt-6">Create New Listing</Button>
      </Link>

      <div className="mt-4">
        <p
          className={`text-sm ${
            resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {pagination.getItemRangeLabel()} of {filteredProperties.length}{" "}
          listings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {currentProperties.length > 0 ? (
          currentProperties.map((property) => (
            <Card
              key={property.id}
              className={
                resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : ""
              }
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-lg font-medium">{property.address}</div>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark"
                      ? "text-gray-300"
                      : "text-muted-foreground"
                  }`}
                >
                  {property.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Status: {property.status}
                  </div>
                  <div className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-primary-100 text-primary-800">
                    {property.type}
                  </div>
                </div>
                {property.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {property.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          resolvedTheme === "dark"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div
            className={`col-span-3 py-8 text-center ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No listings found matching your filters
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size" className="text-sm">
              Items per page:
            </Label>
            <select
              id="page-size"
              value={pagination.pageSize}
              onChange={(e) => pagination.setPageSize(Number(e.target.value))}
              className={`text-sm rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200"
              } p-1`}
            >
              {[6, 12, 24, 48].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.prevPage()}
              disabled={!pagination.hasPrevPage}
              className={
                resolvedTheme === "dark" ? "border-gray-700 bg-gray-800" : ""
              }
            >
              <ChevronLeft size={16} />
            </Button>

            {pagination.visiblePageButtons.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pagination.page === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => pagination.goToPage(pageNumber)}
                className={
                  resolvedTheme === "dark" && pagination.page !== pageNumber
                    ? "border-gray-700 bg-gray-800"
                    : ""
                }
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.nextPage()}
              disabled={!pagination.hasNextPage}
              className={
                resolvedTheme === "dark" ? "border-gray-700 bg-gray-800" : ""
              }
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
