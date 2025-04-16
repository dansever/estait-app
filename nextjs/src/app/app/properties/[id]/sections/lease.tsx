"use client";

import { PropertyLease } from "@/components/property/lease";

interface PropertyLeasePageProps {
  propertyId: string;
  lease?: any;
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
