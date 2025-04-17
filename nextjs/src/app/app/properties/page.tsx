"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import PropertyCard, {
  PropertyStatus,
} from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPropertiesByOwner } from "@/lib/supabase/queries/properties";
import { Database } from "@/lib/types";
import FileManager from "@/components/FileManager";

// Stock photos for placeholders
const STOCK_PHOTOS = [
  "/stock_photos/apartment_1.jpg",
  "/stock_photos/apartment_2.jpg",
  "/stock_photos/apartment_3.jpg",
  "/stock_photos/apartment_4.jpg",
];

type PropertyWithDetails = Database["public"]["Tables"]["properties"]["Row"] & {
  address?: {
    street: string | null;
    apartment_number: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  } | null;
  current_lease?: {
    rent_amount: number | null;
    status: string | null;
  } | null;
  image_url?: string | null;
};

// Interface for the PropertyCard component
interface PropertyCardData {
  id: string;
  image: string;
  title: string;
  address: string;
  status: PropertyStatus;
  rentalPrice: number;
}

export default function PropertiesPage() {
  const { user } = useGlobal();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      setPropertiesLoading(true);
      setPropertiesError("");

      if (!user?.id) return;

      // Fetch properties using the query function
      const propertiesData = await getPropertiesByOwner(user.id);

      // Fetch additional details for each property (addresses and leases)
      const supabase = await createSPASassClient();
      const propertiesWithDetails: PropertyWithDetails[] = await Promise.all(
        propertiesData.map(async (property) => {
          // Get address if exists
          let address = null;
          if (property.address_id) {
            const { data: addressData } = await supabase
              .from("addresses")
              .select("*")
              .eq("id", property.address_id)
              .single();
            address = addressData;
          }

          // Get current lease if exists
          let lease = null;
          const currentDate = new Date().toISOString();
          const { data: leaseData } = await supabase
            .from("leases")
            .select("*")
            .eq("property_id", property.id)
            .lte("lease_start", currentDate)
            .gte("lease_end", currentDate)
            .order("lease_start", { ascending: false })
            .limit(1)
            .single();

          if (leaseData) {
            lease = leaseData;
          }

          // Get property image if exists
          const { data: documents } = await supabase
            .from("documents")
            .select("*")
            .eq("property_id", property.id)
            .limit(1);

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
      const formattedProperties: PropertyCardData[] = propertiesWithDetails.map(
        (property, index) => {
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
          };
        }
      );

      setProperties(formattedProperties);
    } catch (err) {
      setPropertiesError("Failed to load properties");
      console.error("Error loading properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  }, [user]);

  const handleAddProperty = () => {
    router.push("/app/properties/new");
  };

  useEffect(() => {
    if (user?.id) {
      loadProperties();
      setPropertiesLoading(false);
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

      {/* File Management Section - Now using the reusable component */}
      {user?.id && <FileManager userId={user.id} />}
    </div>
  );
}
