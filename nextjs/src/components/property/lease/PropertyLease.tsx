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
import { PropertyWithDetails } from "@/hooks/use-property-details";

interface PropertyLeaseProps {
  propertyId: string;
  lease?: PropertyWithDetails["current_lease"]; // Use the same type from the hook
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
            tenant_id: initialLease.tenant_id,
            lease_start: initialLease.lease_start || "",
            lease_end: initialLease.lease_end || "",
            rent_amount: initialLease.rent_amount ?? 0,
            security_deposit: initialLease.security_deposit ?? 0,
            payment_due_day: initialLease.payment_due_day || 1,
            status: initialLease.status || "active",
            payment_frequency:
              (initialLease.payment_frequency as
                | "monthly"
                | "weekly"
                | "biweekly"
                | "quarterly"
                | "annually"
                | null) || "monthly",
            currency: initialLease.currency || "USD",
          });

          // Check if we have the tenant data inline in the lease
          if (initialLease.tenant) {
            setTenant({
              id: initialLease.tenant.id,
              first_name: initialLease.tenant.first_name || "",
              last_name: initialLease.tenant.last_name || "",
              email: initialLease.tenant.email || "",
              phone: initialLease.tenant.phone || "",
            });
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
    console.log("Adding new lease...");
    setShowAddLeaseDialog(true);
    console.log("showAddLeaseDialog=", { showAddLeaseDialog });
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
          <LeaseDetailsCard lease={lease} onAddLeaseClick={handleAddLease} />
          <TenantInfoCard tenant={tenant} loading={loadingTenant} />
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-2">No Active Lease</h3>
          <p className="text-gray-600 mb-4">
            This property currently doesn&rsquo;t have an active lease. Add a
            new lease to start managing it.
          </p>
        </div>
      )}

      <LeaseHistoryCard propertyId={propertyId} />

      {/* Add Lease Dialog */}
      <AddLeaseDialog
        propertyId={propertyId}
        open={showAddLeaseDialog}
        setOpen={setShowAddLeaseDialog}
        onLeaseAdded={handleLeaseUpdated}
      />

      {/* Edit Lease Dialog */}
      {lease && (
        <EditLeaseDialog
          lease={lease}
          open={showEditLeaseDialog}
          setOpen={setShowEditLeaseDialog}
          onLeaseUpdated={handleLeaseUpdated}
        />
      )}
    </div>
  );
}
