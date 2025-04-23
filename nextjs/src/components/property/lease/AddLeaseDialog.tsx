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
import { createSPASassClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LeaseForm, {
  LeaseFormData,
} from "@/components/property/lease/LeaseForm";

export default function AddLeaseDialog({
  propertyId,
  open,
  onOpenChange,
  onSave,
}: {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formData: LeaseFormData) => {
    try {
      const supabase = await createSPASassClient();

      await supabase.createLease(propertyId, {
        rent_amount: Number(formData.rent_amount),
        currency: formData.currency,
        lease_start: formData.lease_start,
        lease_end: formData.lease_end,
        payment_frequency: formData.payment_frequency,
        payment_due_day: formData.payment_due_day,
        security_deposit: formData.security_deposit,
        is_lease_active: formData.is_lease_active,
        tenant_first_name: formData.first_name.trim(),
        tenant_last_name: formData.last_name.trim(),
        tenant_email: formData.email.trim(),
        tenant_phone: formData.phone.trim(),
      });

      setErrorMessage("");
      await onSave();
      onOpenChange(false);
    } catch (err) {
      console.error("Lease creation failed:", err);
      setErrorMessage("Something went wrong while saving the lease.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Lease</DialogTitle>
          <DialogDescription>
            Fill in the lease details and tenant information.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <LeaseForm
          mode="add"
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
