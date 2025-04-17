"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { NavTabs, TabItem } from "@/components/layout/navTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Users,
  FileText,
  Wallet,
  Wrench,
  Eye,
  MapPin,
} from "lucide-react";

// Import section components
import PropertyOverview from "./sections/overview";
import PropertyLease from "./sections/lease";
import PropertyDocuments from "./sections/documents";
import PropertyFinancials from "./sections/financials";
import PropertyMaintenance from "./sections/maintenance";

// Import utilities for currency formatting
import { formatCurrency } from "@/components/property/lease/lease-utils";
import { usePropertyDetails } from "@/hooks/use-property-details";
import StatusBadge from "@/components/property/lease/StatusBadge";

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [propertyImage, setPropertyImage] = useState<string | null>(null);

  // Use our centralized hook for property details
  const {
    property,
    isLoading,
    error,
    refreshProperty,
    getFormattedAddress,
    getPropertyStatus,
  } = usePropertyDetails(propertyId);

  // Set a placeholder image
  useEffect(() => {
    const imageIndex = Math.floor(Math.random() * 4) + 1;
    setPropertyImage(`/stock_photos/apartment_${imageIndex}.jpg`);
  }, []);

  // Define the tabs for the property sections
  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Eye,
      content: (
        <PropertyOverview propertyId={propertyId} isLoading={isLoading} />
      ),
    },
    {
      id: "lease",
      label: "Lease & Tenants",
      icon: Users,
      content: (
        <PropertyLease
          propertyId={propertyId}
          lease={property?.current_lease}
          isLoading={isLoading}
          onDataChanged={refreshProperty}
        />
      ),
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      content: (
        <PropertyDocuments propertyId={propertyId} isLoading={isLoading} />
      ),
    },
    {
      id: "financials",
      label: "Financials",
      icon: Wallet,
      content: (
        <PropertyFinancials propertyId={propertyId} isLoading={isLoading} />
      ),
    },
    {
      id: "maintenance",
      label: "Maintenance & Tasks",
      icon: Wrench,
      content: (
        <PropertyMaintenance propertyId={propertyId} isLoading={isLoading} />
      ),
    },
  ];

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <Card className="p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => router.push("/app/properties")}
            className="mt-6"
          >
            Return to Properties
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Back button */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      {/* Property header */}
      <div className="mb-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex space-x-4 mt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse md:flex-row gap-6 items-start">
            {/* Left side - Property details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{property?.title}</h1>
              <p className="text-lg text-gray-600 flex items-start gap-2 mt-1">
                <MapPin className="h-5 w-5 mt-1 text-gray-400 flex-shrink-0" />
                {getFormattedAddress(property?.address)}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <StatusBadge status={getPropertyStatus()} />

                {property?.current_lease?.tenant && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Tenant:</span>
                    <span className="font-medium">
                      {property.current_lease.tenant.first_name}{" "}
                      {property.current_lease.tenant.last_name}
                    </span>
                  </div>
                )}

                {property?.current_lease?.rent_amount && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Rent:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        property.current_lease.rent_amount,
                        property.current_lease.currency
                      )}
                      /{property.current_lease.payment_frequency || "monthly"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Right side - Property image */}
            {propertyImage && (
              <div className="md:w-1/3 w-full mb-4 md:mb-0 relative h-48">
                <Image
                  src={propertyImage}
                  alt="Property"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property content tabs */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
            <Skeleton className="h-64 w-full mt-6" />
          </div>
        ) : (
          <NavTabs
            tabs={tabs}
            defaultTabId="overview"
            className="border-t pt-6"
          />
        )}
      </div>
    </div>
  );
}
