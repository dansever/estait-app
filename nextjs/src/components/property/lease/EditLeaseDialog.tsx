"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { createSPASassClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LeaseForm, {
  LeaseFormData,
} from "@/components/property/lease/LeaseForm";

export default function EditLeaseDialog({
  data,
  open,
  onOpenChange,
  onSave,
}: {
  data: EnrichedProperty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const lease = data.rawLease;
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (updatedData: LeaseFormData) => {
    try {
      if (!lease?.id || !lease?.property_id) return;

      const supabase = await createSPASassClient();

      await supabase.updateLease(lease.id, {
        rent_amount: Number(updatedData.rent_amount),
        currency: updatedData.currency,
        lease_start: updatedData.lease_start,
        lease_end: updatedData.lease_end,
        payment_frequency: updatedData.payment_frequency,
        payment_due_day: updatedData.payment_due_day,
        security_deposit: updatedData.security_deposit,
        is_lease_active: updatedData.is_lease_active,
        tenant_first_name: updatedData.first_name,
        tenant_last_name: updatedData.last_name,
        tenant_email: updatedData.email,
        tenant_phone: updatedData.phone,
      });

      await onSave();
      onOpenChange(false);
    } catch (err) {
      console.error("Lease update failed:", err);
      setErrorMessage("Something went wrong while updating the lease.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Lease & Tenant</DialogTitle>
          <DialogDescription>
            Update lease details and tenant information.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <LeaseForm
          mode="edit"
          initialData={{
            rent_amount: lease?.rent_amount?.toString() || "",
            currency: lease?.currency || "USD",
            lease_start: lease?.lease_start || "",
            lease_end: lease?.lease_end || "",
            payment_frequency: lease?.payment_frequency || "monthly",
            payment_due_day: lease?.payment_due_day || 1,
            security_deposit: lease?.security_deposit || 0,
            is_lease_active: lease?.is_lease_active ?? true,
            first_name: lease?.tenant_first_name || "",
            last_name: lease?.tenant_last_name || "",
            email: lease?.tenant_email || "",
            phone: lease?.tenant_phone || "",
          }}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
