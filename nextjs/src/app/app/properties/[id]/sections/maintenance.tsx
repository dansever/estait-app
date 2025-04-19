"use client";

import { PropertyMaintenance } from "@/components/property/maintenance";

interface PropertyMaintenancePageProps {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

export default function PropertyMaintenancePage({
  propertyId,
  isLoading,
  onDataChanged,
}: PropertyMaintenancePageProps) {
  return (
    <PropertyMaintenance
      propertyId={propertyId}
      isLoading={isLoading}
      onDataChanged={onDataChanged}
    />
  );
}
