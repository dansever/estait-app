"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import LoadingThreeDotsJumping from "@/components/general/LoadingJumpingDots";

// --- helper function ---
const propertyCardProps = (property: EnrichedProperty) => ({
  property: {
    id: property.rawProperty.id,
    title: property.rawProperty.title,
    address: `${property.rawAddress?.street || ""} ${
      property.rawAddress?.city || ""
    }, ${property.rawAddress?.country || ""}`,
    images: ["/stock-photos/apartment_1.jpg"],
    status: property.rawActiveLease?.is_lease_active ? "occupied" : "vacant",
    rentalPrice: property.rawActiveLease?.rent_amount || 0,
    rentalCurrency: property.rawActiveLease?.currency || "USD",
    paymentFrequency: property.rawActiveLease?.payment_frequency || "monthly",
    isPublished: true,
    bedrooms: property.rawProperty.bedrooms,
    bathrooms: property.rawProperty.bathrooms,
    sqft: property.rawProperty.size,
    propertyType: property.rawProperty.property_type,
  },
});

export default function PropertiesPage() {
  const { user, propertiesById, setPropertiesById } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "1";
  const [visibleSuccess, setVisibleSuccess] = useState(showSuccess);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    fetchPropertiesAndDetails();
  }, [user]);

  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => setVisibleSuccess(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [showSuccess]);

  const fetchPropertiesAndDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();
      const propertiesList = await supabase.getPropertiesByUser(user!.id);

      const enriched: Record<string, EnrichedProperty> = {};

      for (const property of propertiesList) {
        try {
          const lease = await supabase.getCurrentLeaseByProperty(property.id);
          const address = await supabase.getAddressForProperty(property.id);

          enriched[property.id] = {
            rawProperty: property,
            rawActiveLease: lease ?? undefined,
            rawAddress: address ?? undefined,
          };
        } catch (err: unknown) {
          setError("Failed to load properties or details.");

          if (err instanceof Error) {
            console.error("Supabase Error:", err.message);
          } else {
            console.error("Unknown error:", err);
          }
        }
      }

      setPropertiesById(enriched);
    } catch (err) {
      setError("Failed to load properties or details.");
      console.error("Error loading properties or details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Properties</h1>
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push("/dashboard/add")}
          className="flex items-center gap-2 px-3 sm:px-5 max-w-full"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add New Property</span>
        </Button>
      </div>

      {visibleSuccess && (
        <Alert variant="success" className="mb-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Property added successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="pointer-events-none p-0 m-0 bg-transparent shadow-none border-none">
            <LoadingThreeDotsJumping />
          </div>
        </div>
      ) : Object.keys(propertiesById).length === 0 ? (
        <p className="text-center text-gray-500 text-sm italic">
          No properties found.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.values(propertiesById).map((property) => (
            <PropertyCard
              key={property.rawProperty.id}
              {...propertyCardProps(property)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
