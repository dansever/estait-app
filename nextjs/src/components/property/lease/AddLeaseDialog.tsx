"use client";

import React, { useState, useEffect } from "react";
import { createLease } from "@/lib/supabase/queries/leases";
import { getAllTenants, createTenant } from "@/lib/supabase/queries/tenants";
import { Database } from "@/lib/types";
import { Tenant } from "./lease-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Calendar,
  DivideCircleIcon,
  DollarSign,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { Lease, fetchTenantById } from "./lease-utils";
import { Constants } from "@/lib/types";
import { MdHorizontalSplit } from "react-icons/md";

// Type for lease creation from database schema
type NewLease = Database["public"]["Tables"]["leases"]["Insert"];
type NewTenant = Database["public"]["Tables"]["tenants"]["Insert"];

// List of supported currencies
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "ILS", "NIS"];

interface AddLeaseDialogProps {
  propertyId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onLeaseAdded: () => Promise<void>;
}

export default function AddLeaseDialog({
  propertyId,
  open,
  setOpen,
  onLeaseAdded,
}: AddLeaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState<string>("");
  const [tenantType, setTenantType] = useState<"existing" | "new">("existing");

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

  // New tenant fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [tenantNotes, setTenantNotes] = useState<string>("");

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
  useEffect(() => {
    if (open) {
      loadTenants();
      // Reset form
      setTenantId("");
      setTenantType("existing");
      setLeaseStart("");
      setLeaseEnd("");
      setRentAmount("");
      setSecurityDeposit("");
      setPaymentFrequency("monthly");
      setPaymentDueDay("1");
      setCurrency("USD");
      setNotes("");
      setError("");

      // Reset new tenant fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setTenantNotes("");
    }
  }, [open]);

  const handleAddLease = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!propertyId || !leaseStart || !leaseEnd || !rentAmount) {
      setError("Please fill in all required fields");
      return;
    }

    // Additional validation for new tenant
    if (tenantType === "new") {
      if (!firstName || !lastName) {
        setError("Please fill in tenant's first and last name");
        return;
      }
    } else if (!tenantId) {
      setError("Please select a tenant");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create new tenant first if needed
      let finalTenantId = tenantId;
      let tenantData: Tenant | null = null;

      if (tenantType === "new") {
        const newTenant: NewTenant = {
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          notes: tenantNotes || null,
        };

        const createdTenant = await createTenant(newTenant);
        if (!createdTenant) {
          throw new Error("Failed to create tenant");
        }
        finalTenantId = createdTenant.id;
        tenantData = createdTenant as Tenant;
      }

      const newLease: NewLease = {
        property_id: propertyId,
        tenant_id: finalTenantId,
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

      // If we didn't create a new tenant, fetch the tenant data
      if (tenantType === "existing") {
        tenantData = await fetchTenantById(finalTenantId);
        if (!tenantData) {
          throw new Error("Failed to retrieve tenant data");
        }
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

      setOpen(false);
      await onLeaseAdded();
    } catch (err) {
      console.error("Error adding lease:", err);
      setError("Failed to add lease");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Add New Lease</DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
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

        <form onSubmit={handleAddLease} className="space-y-5 py-4">
          {/* Tenant Section with Tabs */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Tenant
            </Label>

            <Tabs
              defaultValue="existing"
              onValueChange={(value) =>
                setTenantType(value as "existing" | "new")
              }
            >
              <TabsList className="w-full grid grid-cols-2 mb-2">
                <TabsTrigger value="existing">Existing Tenant</TabsTrigger>
                <TabsTrigger value="new">New Tenant</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="mt-0 pt-2">
                <select
                  id="tenant"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                  required={tenantType === "existing"}
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name}
                    </option>
                  ))}
                </select>
              </TabsContent>

              <TabsContent value="new" className="mt-0 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="bg-white"
                      required={tenantType === "new"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="bg-white"
                      required={tenantType === "new"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="bg-white"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <br />

          {/* Lease Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="lease-start"
                className="text-sm font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lease Start Date
              </Label>
              <Input
                id="lease-start"
                type="date"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                className="bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lease-end"
                className="text-sm font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lease End Date
              </Label>
              <Input
                id="lease-end"
                type="date"
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                className="bg-white"
                required
              />
            </div>
          </div>

          {/* Currency, Rent, and Deposit Group */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Details
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currency" className="text-xs text-gray-500">
                  Currency
                </Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="rent-amount" className="text-xs text-gray-500">
                  Monthly Rent
                </Label>
                <Input
                  id="rent-amount"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="1500"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="bg-white"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="security-deposit"
                  className="text-xs text-gray-500"
                >
                  Security Deposit
                </Label>
                <Input
                  id="security-deposit"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="3000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="payment-frequency"
                className="text-sm font-medium"
              >
                Payment Frequency
              </Label>
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
                className="w-full p-2 border rounded-md bg-white"
              >
                {Constants.public.Enums.payment_frequency.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-due-day" className="text-sm font-medium">
                Due Day
              </Label>
              <Input
                id="payment-due-day"
                type="number"
                min="1"
                max="31"
                placeholder="1"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this lease agreement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
