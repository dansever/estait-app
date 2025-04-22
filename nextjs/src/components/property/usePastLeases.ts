"use client";

import { useEffect, useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";

type TenantRow = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type LeaseRow = {
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  currency: string;
  payment_frequency: string;
  tenant_id: string | null;
};

export type TimelineItem = LeaseRow & { tenant: TenantRow | null };

export function usePastLeases(propertyId: string) {
  const [leases, setLeases] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastLeases = async () => {
      try {
        const supabase = await createSPASassClient();
        const leaseData = await supabase.getPastLeasesByProperty(propertyId);

        const leasesWithTenants = await Promise.all(
          leaseData.map(async (lease) => {
            const tenant = lease.tenant_id
              ? await supabase.getTenant(lease.tenant_id)
              : null;
            return { ...lease, tenant };
          })
        );

        setLeases(leasesWithTenants);
      } catch (err) {
        console.error("Failed to load past leases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPastLeases();
  }, [propertyId]);

  return { leases, loading };
}
