import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  EditLeaseFormState,
  Lease,
  getCurrencySymbol,
  initializeEditLeaseForm,
} from "./lease-utils";
import { Loader2 } from "lucide-react";

interface EditLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lease: Lease | null;
  onLeaseUpdated: (updatedLease: Lease) => void;
}

export default function EditLeaseDialog({
  open,
  onOpenChange,
  lease,
  onLeaseUpdated,
}: EditLeaseDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<EditLeaseFormState>({
    lease_start: "",
    lease_end: "",
    rent_amount: 0,
    security_deposit: 0,
    payment_frequency: "monthly",
    payment_due_day: 1,
    status: "active",
    currency: "USD",
  });

  // Initialize form when lease data changes or dialog opens
  useEffect(() => {
    if (lease && open) {
      setFormState(initializeEditLeaseForm(lease));
    }
  }, [lease, open]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    // Extract the field name from the id by removing "lease-" prefix
    const fieldName = id.replace("lease-", "");

    // Handle numeric fields
    if (fieldName === "rent_amount" || fieldName === "security_deposit") {
      setFormState((prev) => ({
        ...prev,
        [fieldName]: parseFloat(value) || 0,
      }));
    }
    // Handle date fields explicitly
    else if (fieldName === "start") {
      setFormState((prev) => ({
        ...prev,
        lease_start: value,
      }));
    } else if (fieldName === "end") {
      setFormState((prev) => ({
        ...prev,
        lease_end: value,
      }));
    }
    // Handle payment_due_day (needs to be a number)
    else if (fieldName === "due-day") {
      setFormState((prev) => ({
        ...prev,
        payment_due_day: parseInt(value) || 1,
      }));
    }
    // Handle frequency which maps to payment_frequency
    else if (fieldName === "frequency") {
      setFormState((prev) => ({
        ...prev,
        payment_frequency: value as
          | "monthly"
          | "weekly"
          | "biweekly"
          | "quarterly"
          | "annually",
      }));
    }
    // Handle currency field explicitly
    else if (fieldName === "currency") {
      setFormState((prev) => ({
        ...prev,
        currency: value,
      }));
    }
    // Handle status field explicitly
    else if (fieldName === "status") {
      setFormState((prev) => ({
        ...prev,
        status: value,
      }));
    }
    // Handle any other fields
    else {
      setFormState((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validation
      if (!formState.lease_start || !formState.lease_end) {
        toast.error("Lease start and end dates are required");
        return;
      }

      if (!formState.rent_amount || formState.rent_amount <= 0) {
        toast.error("Please enter a valid rent amount");
        return;
      }

      if (new Date(formState.lease_end) <= new Date(formState.lease_start)) {
        toast.error("Lease end date must be after start date");
        return;
      }

      if (!lease?.id) {
        toast.error("No lease found to update");
        return;
      }

      const supabase = await createSPASassClient();

      // Update the lease in Supabase
      const { data: updatedLease, error } = await supabase
        .from("leases")
        .update({
          lease_start: formState.lease_start,
          lease_end: formState.lease_end,
          rent_amount: formState.rent_amount,
          security_deposit: formState.security_deposit,
          payment_frequency: formState.payment_frequency,
          payment_due_day: formState.payment_due_day,
          status: formState.status,
          currency: formState.currency,
        })
        .eq("id", lease.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating lease: ${error.message}`);
      }

      if (!updatedLease) {
        throw new Error("Failed to update lease - no data returned");
      }

      // Format the returned lease to match the expected interface
      const formattedLease: Lease = {
        id: updatedLease.id,
        lease_start: updatedLease.lease_start,
        lease_end: updatedLease.lease_end,
        rent_amount: updatedLease.rent_amount,
        security_deposit: updatedLease.security_deposit || 0,
        payment_due_day: updatedLease.payment_due_day || 1,
        status: updatedLease.status,
        payment_frequency: updatedLease.payment_frequency,
        tenant_id: updatedLease.tenant_id,
        currency: updatedLease.currency || "USD",
      };

      // Success - notify parent component
      toast.success("Lease updated successfully");
      onLeaseUpdated(formattedLease);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating lease:", error);
      toast.error("Failed to update lease. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{lease ? "Edit" : "Create"} Lease</DialogTitle>
          <DialogDescription>
            {lease
              ? "Update the lease details for this property."
              : "Create a new lease for this property."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="lease-start" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="lease-start"
                type="date"
                className="bg-white"
                value={formState.lease_start}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lease-end" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="lease-end"
                type="date"
                className="bg-white"
                value={formState.lease_end}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lease-currency" className="text-sm font-medium">
              Currency
            </label>
            <select
              id="lease-currency"
              className="w-full p-2 border rounded-md bg-white"
              value={formState.currency}
              onChange={handleInputChange}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NIS">NIS (₪)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="lease-rent_amount"
                className="text-sm font-medium"
              >
                Monthly Rent
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {getCurrencySymbol(formState.currency)}
                </div>
                <Input
                  id="lease-rent_amount"
                  type="number"
                  className="pl-9 bg-white"
                  placeholder="0.00"
                  value={formState.rent_amount || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lease-security_deposit"
                className="text-sm font-medium"
              >
                Security Deposit
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {getCurrencySymbol(formState.currency)}
                </div>
                <Input
                  id="lease-security_deposit"
                  type="number"
                  className="pl-9 bg-white"
                  placeholder="0.00"
                  value={formState.security_deposit || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="lease-frequency" className="text-sm font-medium">
                Payment Frequency
              </label>
              <select
                id="lease-frequency"
                className="w-full p-2 border rounded-md bg-white"
                value={formState.payment_frequency}
                onChange={handleInputChange}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="lease-due-day" className="text-sm font-medium">
                Payment Due Day
              </label>
              <select
                id="lease-due-day"
                className="w-full p-2 border rounded-md bg-white"
                value={formState.payment_due_day}
                onChange={handleInputChange}
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lease-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="lease-status"
              className="w-full p-2 border rounded-md bg-white"
              value={formState.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting
              ? "Updating..."
              : (lease ? "Update" : "Create") + " Lease"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
