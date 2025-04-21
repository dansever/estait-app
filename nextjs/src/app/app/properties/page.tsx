"use client";
import React, { useState, useEffect } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";

export default function PropertiesPage() {
  const { user } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchPropertiesAndDetails();
    }
  }, [user]);

  const fetchPropertiesAndDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const supabase = await createSPASassClient();

      const propertiesList = await supabase.getPropertiesByUser(user!.id);

      const propertiesEnriched = await Promise.all(
        propertiesList.map(async (property: any) => {
          const [lease] = await supabase.getCurrentLeaseByProperty(property.id);
          const address = await supabase.getAddressForProperty(property.id);

          return {
            id: property.id,
            title: property.title,
            address: `${address?.street || ""} ${address?.city || ""} ,${
              address?.country || ""
            }`,
            image: "/stock-photos/apartment_1.jpg",
            status: lease?.is_lease_active ? "occupied" : "vacant",
            rentalPrice: lease?.rent_amount || 0,
            rentalCurrency: lease?.currency || "USD",
            paymentFrequency: lease?.payment_frequency || "monthly",
          };
        })
      );

      setProperties(propertiesEnriched || []);
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
          ) : properties.length === 0 ? (
            <p className="text-gray-500 text-sm">No properties found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  image={property.image}
                  title={property.title}
                  address={property.address}
                  status={property.status}
                  rentalPrice={property.rentalPrice}
                  rentalCurrency={property.rentalCurrency}
                  paymentFrequency={property.paymentFrequency}
                />
              ))}
            </div>
          )}
        </CardContent>{" "}
      </Card>
    </div>
  );
}
