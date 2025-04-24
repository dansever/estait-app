"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LeaseForm, {
  LeaseFormData,
} from "@/components/property/lease/LeaseForm";
import { createSPASassClient } from "@/lib/supabase/client";
import { parseISO, isWithinInterval } from "date-fns";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { LeaseRow } from "@/lib/enrichedPropertyType";
import { formatDateLong } from "@/lib/formattingHelpers";

export default function EditAddLeaseDialog({
  mode,
  open,
  onOpenChange,
  onSave,
  data,
  leaseToEdit,
}: {
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: () => void;
  data: EnrichedProperty;
  leaseToEdit?: LeaseRow | null;
}) {
  const { rawActiveLease, rawPastLeases } = data;
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use provided open state or maintain internal state
  const isOpen = open !== undefined ? open : dialogOpen;
  const handleOpenChange = onOpenChange || setDialogOpen;

  // This ensures we collect all leases that are not the one being edited
  const allOtherLeases = [
    ...(rawPastLeases || []),
    ...(rawActiveLease ? [rawActiveLease] : []),
  ].filter((l) => l.id !== leaseToEdit?.id);

  // Check if a new or edited lease overlaps with existing leases
  const checkLeaseOverlap = (formData: LeaseFormData): string | null => {
    if (!formData.lease_start || !formData.lease_end) {
      return "Lease start and end dates are required.";
    }

    const newStart = parseISO(formData.lease_start);
    const newEnd = parseISO(formData.lease_end);

    for (const l of allOtherLeases) {
      const start = parseISO(l.lease_start);
      const end = parseISO(l.lease_end);

      // Check for any type of overlap between date ranges
      const overlaps =
        isWithinInterval(newStart, { start, end }) ||
        isWithinInterval(newEnd, { start, end }) ||
        (newStart <= start && newEnd >= end);

      if (overlaps) {
        return (
          <>
            Lease overlaps with another lease from{" "}
            <strong>{formatDateLong(l.lease_start)}</strong> to{" "}
            <strong>{formatDateLong(l.lease_end)}</strong> (
            {l.tenant_first_name} {l.tenant_last_name})
          </>
        );
      }
    }

    return null;
  };

  // Execute form submission
  const handleSubmit = async (formData: LeaseFormData) => {
    const supabase = await createSPASassClient();

    // First check for overlapping leases
    const overlapError = checkLeaseOverlap(formData);
    if (overlapError) {
      setErrorMessage(overlapError);
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "add") {
        if (!data.rawProperty?.id) throw new Error("Missing property ID");

        await supabase.createLease(data.rawProperty.id, {
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
      } else if (mode === "edit") {
        if (!leaseToEdit?.id) throw new Error("Missing lease ID");

        await supabase.updateLease(leaseToEdit.id, {
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
      }

      setErrorMessage("");
      // Call onSave callback if provided, otherwise refresh the page
      if (onSave) {
        await onSave();
      } else {
        // Fallback if no onSave callback
        window.location.reload();
      }
      handleOpenChange(false);
    } catch (err) {
      console.error("Lease save failed:", err);
      setErrorMessage("Something went wrong while saving the lease.");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare initial data for the form
  const initialData = useMemo(() => {
    return mode === "edit" && leaseToEdit
      ? {
          rent_amount: leaseToEdit.rent_amount?.toString() || "",
          currency: leaseToEdit.currency || "USD",
          lease_start: leaseToEdit.lease_start || "",
          lease_end: leaseToEdit.lease_end || "",
          payment_frequency: leaseToEdit.payment_frequency || "monthly",
          payment_due_day: leaseToEdit.payment_due_day || 1,
          security_deposit: leaseToEdit.security_deposit || 0,
          is_lease_active: leaseToEdit.is_lease_active ?? true,
          first_name: leaseToEdit.tenant_first_name || "",
          last_name: leaseToEdit.tenant_last_name || "",
          email: leaseToEdit.tenant_email || "",
          phone: leaseToEdit.tenant_phone || "",
        }
      : undefined;
  }, [mode, leaseToEdit]);

  // Reset error message when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Lease" : "Edit Lease & Tenant"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the lease details and tenant information."
              : "Update lease details and tenant information."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <LeaseForm
          mode={mode}
          leaseToEdit={leaseToEdit}
          activeLease={rawActiveLease}
          allPastLeases={rawPastLeases}
          initialData={initialData}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
