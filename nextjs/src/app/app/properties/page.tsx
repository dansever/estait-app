"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import PropertyCard, {
  PropertyStatus,
  PropertyCardProps,
} from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPropertiesByOwner } from "@/lib/supabase/queries/properties";
import { PropertyWithDetails } from "@/hooks/use-property-details";

// Stock photos for placeholders
const STOCK_PHOTOS = [
  "/stock_photos/apartment_1.jpg",
  "/stock_photos/apartment_2.jpg",
  "/stock_photos/apartment_3.jpg",
  "/stock_photos/apartment_4.jpg",
];

export default function PropertiesPage() {
  const { user } = useGlobal();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      setPropertiesLoading(true);
      setPropertiesError("");

      if (!user?.id) {
        console.error("[loadProperties] User ID is not available");
        return;
      }

      // Fetch properties using the query function
      const propertiesData = await getPropertiesByOwner(user.id);

      // Fetch additional details for each property (addresses and leases)
      const supabase = await createSPASassClient();

      const propertiesWithDetails: PropertyWithDetails[] = await Promise.all(
        propertiesData.map(async (property) => {
          // Get address
          let address = null;
          if (property.address_id) {
            const { data: addressData, error: addressError } = await supabase
              .from("addresses")
              .select("*")
              .eq("id", property.address_id)
              .single();
            if (addressError) {
              console.warn(
                `[loadProperties] Address fetch error for ${property.id}:`,
                addressError
              );
            }
            address = addressData;
          }

          // Get current lease if exists
          let lease = null;
          const currentDate = new Date().toISOString();
          const { data: leaseData, error: leaseError } = await supabase
            .from("leases")
            .select("*")
            .eq("property_id", property.id)
            .limit(1);

          if (leaseError) {
            console.warn(
              `[loadProperties] Lease fetch error for ${property.id}:`,
              leaseError
            );
          }

          // If leaseData is an array with at least one element, use the first one
          lease = leaseData && leaseData.length > 0 ? leaseData[0] : null;

          // Get property image
          const { data: documents, error: docError } = await supabase
            .from("documents")
            .select("*")
            .eq("property_id", property.id)
            .limit(1);
          if (docError) {
            console.warn(
              `[loadProperties] Document fetch error for ${property.id}:`,
              docError
            );
          }

          const image_url =
            documents && documents.length > 0 ? documents[0].file_url : null;

          return {
            ...property,
            address,
            current_lease: lease,
            image_url,
          };
        })
      );

      // Transform data to match PropertyCard props
      const formattedProperties: PropertyCardProps[] =
        propertiesWithDetails.map((property, index) => {
          // Format address string
          const addressParts = [];
          if (property.address?.street)
            addressParts.push(property.address.street);
          if (property.address?.apartment_number)
            addressParts.push(`#${property.address.apartment_number}`);
          if (property.address?.city) addressParts.push(property.address.city);
          if (property.address?.state)
            addressParts.push(property.address.state);
          if (property.address?.zip_code)
            addressParts.push(property.address.zip_code);

          const addressString = addressParts.join(", ");

          // Determine status based on current lease
          const status = property.current_lease
            ? PropertyStatus.OCCUPIED
            : PropertyStatus.VACANT;

          // Get rental price from current lease or default to 0
          const rentalPrice = property.current_lease?.rent_amount || 0;
          const currency = property.current_lease?.currency || "USD";
          const payment_frequency =
            property.current_lease?.payment_frequency || "monthly";

          // Use stock photos as placeholders for image
          const stockPhotoIndex = index % STOCK_PHOTOS.length;
          const placeholderImage = STOCK_PHOTOS[stockPhotoIndex];

          return {
            id: property.id,
            image: property.image_url || placeholderImage,
            title: property.title,
            address: addressString || "Address not available",
            status,
            rentalPrice,
            currency,
            payment_frequency,
          };
        });

      console.log(
        "[loadProperties] Loaded and formatted properties:",
        formattedProperties.length,
        "properties:",
        formattedProperties.map((p) => `${p.title}`)
      );

      setProperties(formattedProperties);
    } catch (err) {
      setPropertiesError("Failed to load properties");
      console.error("[loadProperties] General error loading properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  }, [user]);

  const handleAddProperty = () => {
    router.push("/app/properties/add");
  };

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user, loadProperties]);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Properties</h2>
          <Button
            onClick={handleAddProperty}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>

        {propertiesError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{propertiesError}</AlertDescription>
          </Alert>
        )}

        {propertiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[320px] animate-pulse">
                <div className="h-48 w-full bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="px-4 pb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.image}
                title={property.title}
                address={property.address}
                status={property.status}
                rentalPrice={property.rentalPrice}
                currency={property.currency}
                payment_frequency={property.payment_frequency}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-10">
              <p className="text-gray-500 mb-4">No properties found</p>
              <Button onClick={handleAddProperty}>
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
