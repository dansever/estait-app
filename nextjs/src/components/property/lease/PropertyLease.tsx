"use client";

import { useState, useEffect } from "react";
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
  lease?: any; // Contains the lease data with tenant info nested
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
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

  // Fetch lease info for this property (if not provided via props)
  useEffect(() => {
    async function fetchLeaseInfo() {
      try {
        setLoadingLease(true);

        if (initialLease) {
          // If we're given a lease via props, use that directly
          setLease({
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
          });

          // Check if we have the tenant data inline in the lease
          if (initialLease.tenant) {
            setTenant(initialLease.tenant);
            setLoadingTenant(false);
          }
          // Otherwise if we have a tenant ID, fetch it
          else if (initialLease.tenant_id) {
            try {
              const tenantData = await fetchTenantById(initialLease.tenant_id);
              setTenant(tenantData);
            } catch (err) {
              console.error("Error fetching tenant:", err);
            } finally {
              setLoadingTenant(false);
            }
          } else {
            setLoadingTenant(false);
          }
        } else {
          // Fallback to fetch lease if not provided via props
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
          } else if (data) {
            setLease({
              ...data,
              payment_due_day: data.payment_due_day ?? undefined,
            });

            // If we have a tenant ID, fetch the tenant data
            if (data.tenant_id) {
              try {
                const tenantData = await fetchTenantById(data.tenant_id);
                setTenant(tenantData);
              } catch (err) {
                console.error("Error fetching tenant:", err);
              } finally {
                setLoadingTenant(false);
              }
            } else {
              setLoadingTenant(false);
            }
          } else {
            setLoadingTenant(false);
          }
        }
      } catch (err) {
        console.error("Error fetching lease info:", err);
      } finally {
        setLoadingLease(false);
      }
    }

    fetchLeaseInfo();
  }, [initialLease, propertyId]);

  // Handle lease update
  const handleLeaseUpdated = async () => {
    if (onDataChanged) {
      await onDataChanged();
    }
  };

  // Handle adding a new lease
  const handleAddLease = () => {
    setShowAddLeaseDialog(true);
  };

  // Handle editing an existing lease
  const handleEditLease = () => {
    setShowEditLeaseDialog(true);
  };

  // Show loading state
  if (isLoading || loadingLease) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Lease Information</h2>
        {lease ? (
          <Button
            onClick={handleEditLease}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClipboardEdit className="h-4 w-4" />
            Edit Lease
          </Button>
        ) : (
          <Button
            onClick={handleAddLease}
            variant="default"
            className="flex items-center gap-2"
          >
            <FileSignature className="h-4 w-4" />
            Add New Lease
          </Button>
        )}
      </div>

      {lease ? (
        <div className="grid gap-6 md:grid-cols-2">
          <LeaseDetailsCard lease={lease} />
          <TenantInfoCard tenant={tenant} isLoading={loadingTenant} />
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-2">No Active Lease</h3>
          <p className="text-gray-600 mb-4">
            This property currently doesn't have an active lease. Add a new
            lease to start managing it.
          </p>
          <Button onClick={handleAddLease}>Add New Lease</Button>
        </div>
      )}

      <LeaseHistoryCard propertyId={propertyId} />

      {/* Add Lease Dialog */}
      <AddLeaseDialog
        propertyId={propertyId}
        showDialog={showAddLeaseDialog}
        setShowDialog={setShowAddLeaseDialog}
        onLeaseAdded={handleLeaseUpdated}
      />

      {/* Edit Lease Dialog */}
      {lease && (
        <EditLeaseDialog
          lease={lease}
          showDialog={showEditLeaseDialog}
          setShowDialog={setShowEditLeaseDialog}
          onLeaseUpdated={handleLeaseUpdated}
        />
      )}
    </div>
  );
}
