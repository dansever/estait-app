"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPropertyById } from "@/lib/supabase/queries/properties";
import { createSPASassClient } from "@/lib/supabase/client";
import { NavTabs, TabItem } from "@/components/layout/navTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/lib/types";
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
import {
  getCurrencySymbol,
  formatCurrency,
} from "@/components/property/lease/lease-utils";

type PropertyWithDetails = Database["public"]["Tables"]["properties"]["Row"] & {
  address?: {
    street: string | null;
    apartment_number: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  } | null;
  current_lease?: {
    id: string;
    lease_start: string | null;
    lease_end: string | null;
    rent_amount: number | null;
    security_deposit: number | null;
    payment_due_day: number | null;
    payment_frequency: string | null;
    currency: string;
    status: string | null;
    tenant_id: string | null;
    tenant?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
};

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyImage, setPropertyImage] = useState<string | null>(null);

  // Fetch property data with related details
  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get base property data
      const propertyData = await getPropertyById(propertyId);
      if (!propertyData) {
        setError("Property not found");
        return;
      }

      // Set a placeholder image
      const imageIndex = Math.floor(Math.random() * 4) + 1;
      setPropertyImage(`/stock_photos/apartment_${imageIndex}.jpg`);

      // Fetch related data
      const supabase = await createSPASassClient();

      // Get address
      let address = null;
      if (propertyData.address_id) {
        const { data: addressData } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", propertyData.address_id)
          .single();
        address = addressData;
      }

      // Get current lease and tenant with ALL fields
      let lease = null;
      const currentDate = new Date().toISOString();
      const { data: leaseData } = await supabase
        .from("leases")
        .select(
          `
          id,
          lease_start,
          lease_end,
          rent_amount,
          security_deposit,
          payment_due_day,
          payment_frequency,
          currency,
          status,
          tenant_id,
          tenant:tenant_id (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `
        )
        .eq("property_id", propertyId)
        .lte("lease_start", currentDate)
        .gte("lease_end", currentDate)
        .order("lease_start", { ascending: false })
        .limit(1)
        .single();

      if (leaseData) {
        lease = {
          ...leaseData,
          payment_due_day: leaseData.payment_due_day ?? null,
        };
      }

      // Combine all data
      setProperty({
        ...propertyData,
        address,
        current_lease: lease,
      });
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // Format full address string
  const formatAddress = (address: PropertyWithDetails["address"]) => {
    if (!address) return "Address not available";

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.apartment_number) parts.push(`#${address.apartment_number}`);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip_code) parts.push(address.zip_code);

    return parts.join(", ");
  };

  // Use property's status field from schema or determine based on lease as fallback
  const getStatus = () => {
    if (property?.property_status) {
      return property.property_status;
    }
    // Fallback to legacy method if property_status is not present
    return property?.current_lease ? "occupied" : "vacant";
  };

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
          onDataChanged={fetchPropertyDetails}
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
                {formatAddress(property?.address)}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                {/* Status Badge */}
                {getStatus() === "vacant" ? (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-600"
                  >
                    Vacant
                  </Badge>
                ) : getStatus() === "occupied" ? (
                  <Badge className="bg-green-600">Occupied</Badge>
                ) : getStatus() === "maintenance" ? (
                  <Badge className="bg-orange-600">Maintenance</Badge>
                ) : getStatus() === "listed" ? (
                  <Badge className="bg-blue-600">Listed</Badge>
                ) : (
                  <Badge>Unknown</Badge>
                )}

                {property?.current_lease && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Tenant:</span>
                    <span className="font-medium">
                      {property?.current_lease?.tenant?.first_name}{" "}
                      {property?.current_lease?.tenant?.last_name}
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
              <div className="md:w-1/3 w-full mb-4 md:mb-0">
                <img
                  src={propertyImage}
                  alt="Property"
                  className="w-full h-48 object-cover rounded-lg"
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
