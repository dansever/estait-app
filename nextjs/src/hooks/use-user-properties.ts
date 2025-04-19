// hooks/use-user-properties.ts
import { useState, useEffect, useCallback } from "react";
import { getPropertiesByOwner } from "@/lib/supabase/queries/properties";
import { createSPASassClient } from "@/lib/supabase/client";
import { PropertyCardProps } from "@/components/property/PropertyCard";
import { PropertyStatus } from "@/components/property/PropertyCard";

const STOCK_PHOTOS = [
  "/stock_photos/apartment_1.jpg",
  "/stock_photos/apartment_2.jpg",
  "/stock_photos/apartment_3.jpg",
  "/stock_photos/apartment_4.jpg",
];

export const useUserProperties = (userId: string | undefined) => {
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const propertiesData = await getPropertiesByOwner(userId);
      const supabase = await createSPASassClient();

      const results = await Promise.all(
        propertiesData.map(async (property, index) => {
          let address = null;
          if (property.address_id) {
            const { data: addressData } = await supabase
              .from("addresses")
              .select("*")
              .eq("id", property.address_id)
              .single();
            address = addressData;
          }

          const { data: leaseData } = await supabase
            .from("leases")
            .select("*")
            .eq("property_id", property.id)
            .lte("lease_start", new Date().toISOString())
            .gte("lease_end", new Date().toISOString())
            .order("lease_start", { ascending: false })
            .limit(1);

          const lease = leaseData?.[0];

          const { data: docs } = await supabase
            .from("documents")
            .select("*")
            .eq("property_id", property.id)
            .limit(1);

          const formatted: PropertyCardProps = {
            id: property.id,
            title: property.title,
            image:
              docs?.[0]?.file_url || STOCK_PHOTOS[index % STOCK_PHOTOS.length],
            address: [
              address?.street,
              address?.apartment_number && `#${address.apartment_number}`,
              address?.city,
              address?.state,
              address?.zip_code,
            ]
              .filter(Boolean)
              .join(", "),
            status: lease ? PropertyStatus.OCCUPIED : PropertyStatus.VACANT,
            rentalPrice: lease?.rent_amount || 0,
            currency: lease?.currency || "USD",
            payment_frequency: lease?.payment_frequency || "monthly",
          };

          return formatted;
        })
      );

      setProperties(results);
    } catch (err) {
      console.error(err);
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProperties();
  }, [userId, loadProperties]);

  return { properties, loading, error };
};
