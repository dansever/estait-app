"use client";

import React, { useState } from "react";
import { createLease } from "@/lib/supabase/queries/leases";
import { getAllTenants } from "@/lib/supabase/queries/tenants";
import { Database } from "@/lib/types";
import { Tenant } from "./lease-utils";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import { Lease, fetchTenantById } from "./lease-utils";

// Type for lease creation from database schema
type NewLease = Database["public"]["Tables"]["leases"]["Insert"];

// export interface Tenant {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string | null;
//   phone: string | null;
//   notes: string | null;
//   created_at: string | null;
// }

interface AddLeaseDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeaseCreated: (newLease: Lease, newTenant: Tenant) => Promise<void>;
}

export default function AddLeaseDialog({
  propertyId,
  open,
  onOpenChange,
  onLeaseCreated,
}: AddLeaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState<string>("");

  // Form fields
  const [leaseStart, setLeaseStart] = useState<string>("");
  const [leaseEnd, setLeaseEnd] = useState<string>("");
  const [rentAmount, setRentAmount] = useState<string>("");
  const [securityDeposit, setSecurityDeposit] = useState<string>("");
  const [paymentFrequency, setPaymentFrequency] = useState<
    "monthly" | "weekly" | "biweekly" | "quarterly" | "annually"
  >("monthly");
  const [paymentDueDay, setPaymentDueDay] = useState<string>("1");
  const [currency, setCurrency] = useState<string>("USD");
  const [notes, setNotes] = useState<string>("");

  // Load tenants when dialog opens
  const loadTenants = async () => {
    try {
      const tenantsData = await getAllTenants();
      // Transform the tenant data to match the Tenant interface
      const formattedTenants = (tenantsData || []).map((tenant) => ({
        id: tenant.id,
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        email: tenant.email || "", // Convert null to empty string
        phone: tenant.phone || "", // Convert null to empty string
        notes: tenant.notes || undefined, // Convert null to undefined
        created_at: tenant.created_at || undefined, // Convert null to undefined
      }));
      setTenants(formattedTenants);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setError("Failed to load tenants");
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      loadTenants();
      // Reset form
      setTenantId("");
      setLeaseStart("");
      setLeaseEnd("");
      setRentAmount("");
      setSecurityDeposit("");
      setPaymentFrequency("monthly");
      setPaymentDueDay("1");
      setCurrency("USD");
      setNotes("");
      setError("");
    }
  }, [open]);

  const handleAddLease = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!propertyId || !tenantId || !leaseStart || !leaseEnd || !rentAmount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const newLease: NewLease = {
        property_id: propertyId,
        tenant_id: tenantId,
        lease_start: leaseStart,
        lease_end: leaseEnd,
        rent_amount: parseFloat(rentAmount),
        security_deposit: securityDeposit
          ? parseFloat(securityDeposit)
          : undefined,
        payment_frequency: paymentFrequency,
        payment_due_day: parseInt(paymentDueDay),
        currency: currency,
        status: "active",
        notes: notes || null,
      };

      const createdLease = await createLease(newLease);

      if (!createdLease) {
        throw new Error("Failed to create lease - no data returned");
      }

      // Fetch the tenant data to pass back to parent
      const tenantData = await fetchTenantById(tenantId);

      if (!tenantData) {
        throw new Error("Failed to retrieve tenant data");
      }

      // Format lease object to match the Lease interface
      const formattedLease: Lease = {
        id: createdLease.id,
        lease_start: createdLease.lease_start,
        lease_end: createdLease.lease_end,
        rent_amount: createdLease.rent_amount,
        security_deposit: createdLease.security_deposit || 0,
        payment_due_day: createdLease.payment_due_day || 1,
        status: createdLease.status,
        payment_frequency: createdLease.payment_frequency,
        tenant_id: createdLease.tenant_id,
        currency: createdLease.currency || "USD",
      };

      // Convert tenant data to match Tenant interface in this file
      const formattedTenant: Tenant = {
        ...tenantData,
        notes: tenantData.notes || undefined, // Convert null to undefined
        created_at: tenantData.created_at || undefined, // Convert null to undefined
      };

      onOpenChange(false);
      await onLeaseCreated(formattedLease, formattedTenant);
    } catch (err) {
      console.error("Error adding lease:", err);
      setError("Failed to add lease");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lease</DialogTitle>
          <DialogDescription>
            Create a new lease agreement for this property.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAddLease} className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="tenant"
              className="text-sm font-medium flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Tenant
            </label>
            <select
              id="tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.first_name} {tenant.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Rest of the form remains the same */}
          {/* ... existing form fields ... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="lease-start"
                className="text-sm font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lease Start Date
              </label>
              <Input
                id="lease-start"
                type="date"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lease-end"
                className="text-sm font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lease End Date
              </label>
              <Input
                id="lease-end"
                type="date"
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="rent-amount"
                className="text-sm font-medium flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Monthly Rent
              </label>
              <Input
                id="rent-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1500.00"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="security-deposit"
                className="text-sm font-medium flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Security Deposit
              </label>
              <Input
                id="security-deposit"
                type="number"
                min="0"
                step="0.01"
                placeholder="1500.00"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="payment-frequency"
                className="text-sm font-medium"
              >
                Payment Frequency
              </label>
              <select
                id="payment-frequency"
                value={paymentFrequency}
                onChange={(e) =>
                  setPaymentFrequency(
                    e.target.value as
                      | "monthly"
                      | "weekly"
                      | "biweekly"
                      | "quarterly"
                      | "annually"
                  )
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="payment-due-day" className="text-sm font-medium">
                Due Day
              </label>
              <Input
                id="payment-due-day"
                type="number"
                min="1"
                max="31"
                placeholder="1"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this lease agreement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Lease
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
