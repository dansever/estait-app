"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Lease, Tenant, fetchTenantById } from "./lease-utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardEdit, FileSignature } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import LeaseDetailsCard from "./LeaseDetailsCard";
import TenantInfoCard from "./TenantInfoCard";
import LeaseHistoryCard from "./LeaseHistoryCard";
import EditLeaseDialog from "./EditLeaseDialog";
import AddLeaseDialog from "./AddLeaseDialog";

interface PropertyLeaseProps {
  propertyId: string;
  lease?: any; // Accept the lease passed from the parent component
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

interface AddLeaseDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  propertyId: string;
  onLeaseCreated: () => Promise<void>;
}

export default function PropertyLease({
  propertyId,
  lease: initialLease,
  isLoading,
  onDataChanged,
}: PropertyLeaseProps) {
  const [lease, setLease] = useState<Lease | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingLease, setLoadingLease] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [showAddLeaseDialog, setShowAddLeaseDialog] = useState(false);
  const [showEditLeaseDialog, setShowEditLeaseDialog] = useState(false);

  // Fetch lease info for this property
  useEffect(() => {
    async function fetchLeaseInfo() {
      try {
        setLoadingLease(true);

        const supabase = await createSPASassClient();
        const { data, error } = await supabase
          .from("leases")
          .select("*")
          .eq("property_id", propertyId)
          .order("lease_start", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching lease:", error);
          // No data found or other error
        } else if (data) {
          setLease(data);

          // If we have a tenant ID, fetch the tenant data
          if (data.tenant_id) {
            const tenantData = await fetchTenantById(data.tenant_id);
            setTenant(tenantData);
          } else {
            setLoadingTenant(false);
          }
        } else {
          setLoadingTenant(false);
        }
      } catch (err) {
        console.error("Error fetching lease info:", err);
        setLoadingTenant(false);
      } finally {
        setLoadingLease(false);
      }
    }

    // Always use the initialLease if provided (from parent)
    if (initialLease) {
      const formattedLease = {
        id: initialLease.id,
        lease_start: initialLease.lease_start,
        lease_end: initialLease.lease_end,
        rent_amount: initialLease.rent_amount,
        security_deposit: initialLease.security_deposit,
        payment_due_day: initialLease.payment_due_day || 1,
        status: initialLease.status || "active",
        payment_frequency: initialLease.payment_frequency || "monthly",
        tenant_id: initialLease.tenant_id,
        currency: initialLease.currency || "USD",
      };
      setLease(formattedLease);

      // If we have tenant data from the initial lease, use it directly
      if (initialLease.tenant) {
        setTenant(initialLease.tenant);
        setLoadingTenant(false);
      }
      // If we only have a tenant ID, fetch the full tenant data
      else if (initialLease.tenant_id) {
        fetchTenantById(initialLease.tenant_id).then((data) => {
          setTenant(data);
          setLoadingTenant(false);
        });
      } else {
        setLoadingTenant(false);
      }

      setLoadingLease(false);
    } else if (propertyId) {
      fetchLeaseInfo();
    }
  }, [propertyId, initialLease]);

  // Handle adding a new lease
  const handleAddLease = () => {
    setShowAddLeaseDialog(true);
  };

  // Handle editing lease
  const handleEditLease = () => {
    setShowEditLeaseDialog(true);
  };

  // Handle lease update from edit dialog
  const handleLeaseUpdated = async (updatedLease: Lease) => {
    setLease(updatedLease);
    // Refresh the parent's data to ensure we're showing the most up-to-date information
    if (onDataChanged) {
      await onDataChanged();
    }
  };

  // Handle new lease creation
  const handleLeaseCreated = async (newLease: Lease, newTenant: Tenant) => {
    setLease(newLease);
    setTenant(newTenant);
    // Refresh the parent's data
    if (onDataChanged) {
      await onDataChanged();
    }
  };

  if (isLoading || loadingLease) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section headers */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center">
          <FileSignature className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Lease & Tenants</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditLease} disabled={!lease}>
            <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Lease
          </Button>
          {!tenant && (
            <Button onClick={handleAddLease}>
              <FileSignature className="h-4 w-4 mr-2" /> New Lease
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lease information */}
        <LeaseDetailsCard lease={lease} onAddLeaseClick={handleAddLease} />

        {/* Tenant information and lease history */}
        <div className="space-y-6">
          <TenantInfoCard
            tenant={tenant}
            lease={lease}
            loading={loadingTenant}
            onAddLeaseClick={handleAddLease}
          />

          <LeaseHistoryCard lease={lease} />
        </div>
      </div>

      {/* Dialogs */}
      <EditLeaseDialog
        open={showEditLeaseDialog}
        onOpenChange={setShowEditLeaseDialog}
        lease={lease}
        onLeaseUpdated={handleLeaseUpdated}
      />

      <AddLeaseDialog
        open={showAddLeaseDialog}
        onOpenChange={setShowAddLeaseDialog}
        propertyId={propertyId}
        onLeaseCreated={async () => {
          if (lease && tenant) {
            await handleLeaseCreated(lease, tenant);
          }
        }}
      />
    </div>
  );
}
