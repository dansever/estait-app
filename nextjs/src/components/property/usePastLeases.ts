"use client";

import { useEffect, useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type LeaseRow = Database["public"]["Tables"]["leases"]["Row"];

export function usePastLeases(propertyId: string) {
  const [leases, setLeases] = useState<LeaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastLeases = async () => {
      try {
        const supabase = await createSPASassClient();
        const leaseData = await supabase.getPastLeasesByProperty(propertyId);

        // Tenant data is now in the lease row, no extra fetch needed
        setLeases(leaseData);
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
