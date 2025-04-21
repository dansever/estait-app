"use client";
import React, { useState, useEffect } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";

// --- helper function ---
const propertyCardProps = (property: EnrichedProperty) => ({
  id: property.rawProperty.id,
  image: "/stock-photos/apartment_1.jpg",
  title: property.rawProperty.title,
  address: `${property.rawAddress?.street || ""} ${
    property.rawAddress?.city || ""
  }, ${property.rawAddress?.country || ""}`,
  status: property.rawLease?.is_lease_active ? "occupied" : "vacant",
  rentalPrice: property.rawLease?.rent_amount || 0,
  rentalCurrency: property.rawLease?.currency || "USD",
  paymentFrequency: property.rawLease?.payment_frequency || "monthly",
});

export default function PropertiesPage() {
  const { user, propertiesById, setPropertiesById } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchPropertiesAndDetails();
  }, [user]);

  const fetchPropertiesAndDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();
      const propertiesList = await supabase.getPropertiesByUser(user!.id);

      const enriched: Record<string, EnrichedProperty> = {};

      for (const property of propertiesList) {
        try {
          const [lease] = await supabase.getCurrentLeaseByProperty(property.id);
          const address = await supabase.getAddressForProperty(property.id);

          enriched[property.id] = {
            rawProperty: property,
            rawLease: lease ?? undefined,
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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : Object.keys(propertiesById).length === 0 ? (
            <p className="text-gray-500 text-sm">No properties found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Object.values(propertiesById).map((property) => (
                <PropertyCard
                  key={property.rawProperty.id}
                  {...propertyCardProps(property)}
                />
              ))}
            </div>
          )}
        </CardContent>{" "}
      </Card>
    </div>
  );
}
