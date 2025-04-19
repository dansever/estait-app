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
import { PropertyService } from "@/lib/services/PropertyService";
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
      start_date: string;
      end_date: string | null;
      rent_amount: number;
      payment_frequency: string;
      status: string;
      currency: string;
      tenant?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
      } | null;
    } | null;
  };

interface UsePropertyDetailsReturn {
  property: PropertyWithDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshProperty: () => Promise<void>;
  getFormattedAddress: (address: any) => string;
  getPropertyStatus: () => string;
}

/**
 * Custom hook for managing property details
 */
export function usePropertyDetails(
  propertyId: string
): UsePropertyDetailsReturn {
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load property data
  const loadProperty = useCallback(async () => {
    if (!propertyId) {
      setError("Property ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const propertyData = await PropertyService.getPropertyById(propertyId);
      if (!propertyData) {
        setError("Property not found");
        setProperty(null);
        return;
      }

      setProperty(propertyData);
    } catch (err) {
      console.error("Error loading property details:", err);
      setError("Failed to load property details");
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Format address
  const getFormattedAddress = useCallback((address: any): string => {
    if (!address) return "Address not available";

    const addressParts = [];
    if (address.street) addressParts.push(address.street);
    if (address.apartment_number)
      addressParts.push(`#${address.apartment_number}`);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.zip_code) addressParts.push(address.zip_code);

    return addressParts.join(", ") || "Address not available";
  }, []);

  // Determine property status based on current lease
  const getPropertyStatus = useCallback((): string => {
    if (!property) return "vacant";

    if (property.property_status === "maintenance") {
      return "maintenance";
    } else if (property.property_status === "listed") {
      return "listed";
    } else if (property.current_lease?.status === "active") {
      return "occupied";
    }

    return "vacant";
  }, [property]);

  // Refresh property data
  const refreshProperty = useCallback(async () => {
    await loadProperty();
  }, [loadProperty]);

  // Initial load
  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  return {
    property,
    isLoading,
    error,
    refreshProperty,
    getFormattedAddress,
    getPropertyStatus,
  };
}
