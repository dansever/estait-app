"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/types";
import PropertyCard from "@/components/property/PropertyCard";
import { SassClient, ClientType } from "@/lib/supabase/unified";

export default function PropertiesPage() {
  const supabase = createClientComponentClient<Database>();
  const sassClient = new SassClient(supabase, ClientType.SPA);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertiesAndDetails = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Error getting user:", authError);
        return;
      }

      try {
        const properties = await sassClient.getPropertiesByUser(user.id);
        const enriched = await Promise.all(
          properties.map(async (property) => {
            const lease = (
              await sassClient.getCurrentLeaseByProperty(property.id)
            )[0];
            const address = await sassClient.getAddressForProperty(property.id);

            return {
              id: property.id,
              title: property.title,
              address: `${address?.street || ""} ${address?.city || ""}`,
              image: "/stock_photos/apartment_1.jpg",
              status: lease ? "occupied" : "vacant",
              rentalPrice: lease?.rent_amount || 0,
            };
          })
        );

        setProperties(enriched);
      } catch (err) {
        console.error("Error loading property data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertiesAndDetails();
  }, [supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Properties</h1>
      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <p>No properties found.</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
