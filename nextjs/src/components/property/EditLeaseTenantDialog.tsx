"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Constants } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { createSPASassClient } from "@/lib/supabase/client";
import { currencyList } from "@/lib/constants";

type EditLeaseTenantDialogProps = {
  data: EnrichedProperty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
};

export default function EditLeaseTenantDialog({
  data,
  open,
  onOpenChange,
  onSave,
}: EditLeaseTenantDialogProps) {
  const lease = data.rawLease;
  const tenant = data.rawTenant;

  const [formData, setFormData] = React.useState({
    rent_amount: lease?.rent_amount || 0,
    currency: lease?.currency || "USD",
    lease_start: lease?.lease_start || "",
    lease_end: lease?.lease_end || "",
    payment_frequency: lease?.payment_frequency || "monthly",
    payment_due_day: lease?.payment_due_day || 1,
    security_deposit: lease?.security_deposit || 0,
    is_lease_active: lease?.is_lease_active ?? true,

    first_name: tenant?.first_name || "",
    last_name: tenant?.last_name || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    notes: tenant?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!lease?.id || !lease?.property_id || !tenant?.id) return;

      // Validate dates
      if (formData.lease_end < formData.lease_start) {
        alert("Lease end date cannot be before start date.");
        return;
      }

      const supabase = await createSPASassClient();

      await supabase.updateLease(lease.id, {
        rent_amount: formData.rent_amount,
        currency: formData.currency,
        lease_start: formData.lease_start,
        lease_end: formData.lease_end,
        payment_frequency: formData.payment_frequency,
        payment_due_day: formData.payment_due_day,
        security_deposit: formData.security_deposit,
        is_lease_active: formData.is_lease_active,
      });

      await supabase.updateTenant(tenant.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
      });

      await onSave();
      onOpenChange(false);
    } catch (err) {
      console.error("Lease or tenant update failed:", err);
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

        <div className="grid grid-cols-1 gap-6 py-4">
          {/* Lease Details */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Lease Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rent Amount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="rent_amount"
                      type="number"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="min-w-[100px] px-2 py-2 border rounded"
                    >
                      {currencyList().map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lease Start
                  </label>
                  <Input
                    name="lease_start"
                    type="date"
                    value={formData.lease_start}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lease End
                  </label>
                  <Input
                    name="lease_end"
                    type="date"
                    value={formData.lease_end}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Frequency
                  </label>
                  <select
                    name="payment_frequency"
                    value={formData.payment_frequency}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-2"
                  >
                    {Constants.public.Enums.PAYMENT_FREQUENCY.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Due Day
                  </label>
                  <Input
                    name="payment_due_day"
                    type="number"
                    value={formData.payment_due_day}
                    onChange={handleChange}
                    min={1}
                    max={31}
                    disabled={formData.payment_frequency !== "monthly"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Security Deposit
                  </label>
                  <Input
                    name="security_deposit"
                    type="number"
                    value={formData.security_deposit}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Info */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <Input
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
