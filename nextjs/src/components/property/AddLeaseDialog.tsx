"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Constants } from "@/lib/types";
import { createSPASassClient } from "@/lib/supabase/client";
import { currencyList } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    rent_amount: "",
    currency: "USD",
    lease_start: "",
    lease_end: "",
    payment_frequency: "monthly",
    payment_due_day: 1,
    security_deposit: 0,
    is_lease_active: true,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!open) return;
    setFormData({
      rent_amount: "",
      currency: "USD",
      lease_start: "",
      lease_end: "",
      payment_frequency: "monthly",
      payment_due_day: 1,
      security_deposit: 0,
      is_lease_active: true,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    });
    setErrorMessage("");
    setFormErrors({});
  }, [open]);

  const inputClass = (field: string) =>
    formErrors[field] ? "border-danger bg-danger-100" : "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const isNumberField = [
      "rent_amount",
      "security_deposit",
      "payment_due_day",
    ].includes(name);
    const isInvalid = isNumberField && value !== "" && Number(value) < 0;

    setFormErrors((prev) => ({
      ...prev,
      [name]: isInvalid,
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const hasErrors = Object.values(formErrors).some(Boolean);
    const isMissing =
      !formData.rent_amount || !formData.lease_start || !formData.lease_end;

    if (hasErrors || isMissing) {
      setErrorMessage("Please fix all errors before submitting.");
      return;
    }

    if (new Date(formData.lease_end) < new Date(formData.lease_start)) {
      setErrorMessage("Lease end date cannot be before start date.");
      return;
    }

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

      setErrorMessage(""); // Clear errors
      await onSave();
      onOpenChange(false);
    } catch (err) {
      console.error("Lease creation failed:", err);
      setErrorMessage("Something went wrong while saving the lease.");
    }
  };

  const firstInvalid = Object.keys(formErrors).find((key) => formErrors[key]);
  if (firstInvalid) {
    document
      .querySelector(`[name="${firstInvalid}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
    document.querySelector(`[name="${firstInvalid}"]`)?.focus();
  }

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

        <div className="grid grid-cols-1 gap-6 py-4">
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
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Lease Details</h3>
              <div className="space-y-4">
                {/* Row 1: Lease Start & End */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Row 2: Currency, Rent Amount, Security Deposit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-2 py-2 border rounded"
                    >
                      {currencyList().map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rent Amount
                    </label>
                    <Input
                      name="rent_amount"
                      type="number"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className={inputClass("rent_amount")}
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
                      className={inputClass("security_deposit")}
                    />
                  </div>
                </div>

                {/* Row 3: Payment Frequency & Due Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Frequency
                    </label>
                    <select
                      name="payment_frequency"
                      value={formData.payment_frequency}
                      onChange={handleChange}
                      className="w-full px-2 py-2 border rounded"
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
                      className={inputClass("payment_due_day")}
                      min={1}
                      max={31}
                      disabled={formData.payment_frequency !== "monthly"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Lease</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
