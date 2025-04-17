/**
 * File: use-property-details.tsx
 *
 * Responsibility:
 * Custom hook for fetching and managing detailed property information
 *
 * Key features:
 * - Fetches property data along with related address, lease, and tenant information
 * - Provides helper functions for formatting addresses and determining property status
 * - Calculates financial metrics for property performance analysis
 *
 * Components:
 * - usePropertyDetails: Hook that loads property details and provides access to property data and utility functions
 */

import { useState, useEffect, useCallback } from "react";
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
    lease_history?: Array<{
      id: string;
      lease_start: string | null;
      lease_end: string | null;
      rent_amount: number | null;
      status: string | null;
    }>;
  };

interface UsePropertyDetailsReturn {
  property: PropertyWithDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshProperty: (timestamp?: number) => Promise<void>;
  getFormattedAddress: (address: PropertyWithDetails["address"]) => string;
  getPropertyStatus: () => "vacant" | "occupied" | "maintenance" | "listed";
  getLeaseStatus: () => "active" | "expired" | "upcoming" | "none";
  calculateFinancials: () => {
    monthlyIncome: number;
    monthlyExpenses: number;
    cashFlow: number;
    roi: number;
  };
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

  // Helper function to determine lease status
  const getLeaseStatus = (): "active" | "expired" | "upcoming" | "none" => {
    if (!property?.current_lease) return "none";

    const now = new Date();
    const leaseStart = property.current_lease.lease_start
      ? new Date(property.current_lease.lease_start)
      : null;
    const leaseEnd = property.current_lease.lease_end
      ? new Date(property.current_lease.lease_end)
      : null;

    if (!leaseStart || !leaseEnd) return "none";

    if (now < leaseStart) return "upcoming";
    if (now > leaseEnd) return "expired";
    return "active";
  };

  // Helper function to calculate financial metrics
  const calculateFinancials = () => {
    const monthlyIncome = property?.current_lease?.rent_amount || 0;
    // Estimate monthly expenses (could be replaced with actual data)
    const monthlyExpenses = 350;
    const cashFlow = monthlyIncome - monthlyExpenses;
    const roi =
      monthlyIncome > 0
        ? (((monthlyIncome - monthlyExpenses) * 12) /
            (property?.purchase_price || 1)) *
          100
        : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      cashFlow,
      roi,
    };
  };

  // Fetch property data with related details
  const fetchPropertyDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get base property data
      const propertyData = await getPropertyById(propertyId);
      if (!propertyData) {
        setError("Property not found");
        return;
      }

      // Validate property data
      if (typeof propertyData !== "object") {
        setError("Invalid property data received");
        return;
      }

      // Fetch related data
      const supabase = await createSPASassClient();

      // Get address
      let address = null;
      if (propertyData.address_id) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", propertyData.address_id)
          .single();

        if (addressError) {
          console.error("Error fetching address:", addressError);
        } else {
          address = addressData;
        }
      }

      // Get current lease using separate queries instead of nested query
      let lease = null;
      const currentDate = new Date().toISOString();

      // First fetch the lease - making sure to get active leases by checking
      // that start date is in the past and end date is in the future
      const { data: leaseData, error: leaseError } = await supabase
        .from("leases")
        .select("*")
        .eq("property_id", propertyId)
        .lte("lease_start", currentDate)
        .gte("lease_end", currentDate)
        .order("lease_start", { ascending: false })
        .limit(1);

      // Log leases for debugging
      console.log("Lease query results:", {
        propertyId,
        currentDate,
        leaseData,
        leaseError,
      });

      if (leaseError) {
        console.error("Error fetching current lease:", leaseError);
      }

      // Check if we have lease data and it's an array with at least one item
      const currentLease =
        leaseData && leaseData.length > 0 ? leaseData[0] : null;

      // If we have a lease, fetch the tenant separately
      if (currentLease && currentLease.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", currentLease.tenant_id)
          .single();

        if (tenantError) {
          console.error("Error fetching tenant:", tenantError);
        } else {
          // Combine lease and tenant data
          lease = {
            ...currentLease,
            payment_due_day: currentLease.payment_due_day ?? null,
            tenant: tenantData,
          };
        }
      } else if (currentLease) {
        lease = {
          ...currentLease,
          payment_due_day: currentLease.payment_due_day ?? null,
          tenant: null,
        };
      }

      // Get lease history
      const { data: leaseHistoryData, error: historyError } = await supabase
        .from("leases")
        .select("id, lease_start, lease_end, rent_amount, status")
        .eq("property_id", propertyId)
        .order("lease_start", { ascending: false })
        .limit(5);

      if (historyError) {
        console.error("Error fetching lease history:", historyError);
      }

      // Combine all data
      const propertyWithDetails: PropertyWithDetails = {
        ...propertyData,
        address,
        current_lease: lease,
        lease_history: leaseHistoryData || [],
      };

      setProperty(propertyWithDetails);
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details");
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }

    // Set up a refresh interval for time-sensitive data (optional)
    // const refreshInterval = setInterval(() => fetchPropertyDetails(), 5 * 60 * 1000);
    // return () => clearInterval(refreshInterval);
  }, [propertyId, fetchPropertyDetails]);

  return {
    property,
    isLoading,
    error,
    refreshProperty: fetchPropertyDetails,
    getFormattedAddress,
    getPropertyStatus,
    getLeaseStatus,
    calculateFinancials,
  };
}
