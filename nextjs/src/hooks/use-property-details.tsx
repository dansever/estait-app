import { useState, useEffect } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { getPropertyById } from "@/lib/supabase/queries/properties";
import { Database } from "@/lib/types";

export type PropertyWithDetails =
  Database["public"]["Tables"]["properties"]["Row"] & {
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

interface UsePropertyDetailsReturn {
  property: PropertyWithDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshProperty: () => Promise<void>;
  getFormattedAddress: (address: PropertyWithDetails["address"]) => string;
  getPropertyStatus: () => "vacant" | "occupied" | "maintenance" | "listed";
}

export function usePropertyDetails(
  propertyId: string
): UsePropertyDetailsReturn {
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format address
  const getFormattedAddress = (address: PropertyWithDetails["address"]) => {
    if (!address) return "Address not available";

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.apartment_number) parts.push(`#${address.apartment_number}`);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip_code) parts.push(address.zip_code);

    return parts.join(", ");
  };

  // Helper function to determine property status
  const getPropertyStatus = ():
    | "vacant"
    | "occupied"
    | "maintenance"
    | "listed" => {
    // First, check explicit property status field
    if (property?.property_status) {
      return property.property_status as
        | "vacant"
        | "occupied"
        | "maintenance"
        | "listed";
    }

    // Check if there's a current lease with a tenant
    if (property?.current_lease?.tenant_id) {
      return "occupied";
    }

    // Default fallback
    return "vacant";
  };

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
      const propertyWithDetails: PropertyWithDetails = {
        ...propertyData,
        address,
        current_lease: lease,
      };

      setProperty(propertyWithDetails);
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

  return {
    property,
    isLoading,
    error,
    refreshProperty: fetchPropertyDetails,
    getFormattedAddress,
    getPropertyStatus,
  };
}
