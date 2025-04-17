"use client";

import { PropertyLease } from "@/components/property/lease";
import { PropertyWithDetails } from "@/hooks/use-property-details";

interface PropertyLeasePageProps {
  propertyId: string;
  lease?: PropertyWithDetails["current_lease"];
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

export default function PropertyLeasePage({
  propertyId,
  lease,
  isLoading,
  onDataChanged,
}: PropertyLeasePageProps) {
  return (
    <PropertyLease
      propertyId={propertyId}
      lease={lease}
      isLoading={isLoading}
      onDataChanged={onDataChanged}
    />
  );
}
