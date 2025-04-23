import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export type LeaseFormData = {
  rent_amount: string;
  currency: string;
  lease_start: string;
  lease_end: string;
  payment_frequency: string;
  payment_due_day: number;
  security_deposit: number;
  is_lease_active: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type LeaseFormProps = {
  mode: "add" | "edit";
  initialData?: LeaseFormData;
  onSubmit: (data: LeaseFormData) => void;
  errorMessage?: string;
  setErrorMessage: (msg: string) => void;
};

export default function LeaseForm({
  mode,
  initialData,
  onSubmit,
  errorMessage,
  setErrorMessage,
}: LeaseFormProps) {
  const [formData, setFormData] = useState<LeaseFormData>(
    initialData || {
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
    }
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const handleSubmit = () => {
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

    setErrorMessage("");
    onSubmit(formData);
  };

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 py-4">
        {/* Tenant Info */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Details */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Lease Details</h3>
            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lease_start">Lease Start Date</Label>
                  <Input
                    id="lease_start"
                    name="lease_start"
                    type="date"
                    value={formData.lease_start}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lease_end">Lease End Date</Label>
                  <Input
                    id="lease_end"
                    name="lease_end"
                    type="date"
                    value={formData.lease_end}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Money Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
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
                  <Label htmlFor="rent_amount">Rent Amount</Label>
                  <Input
                    id="rent_amount"
                    name="rent_amount"
                    type="number"
                    value={formData.rent_amount}
                    onChange={handleChange}
                    className={inputClass("rent_amount")}
                  />
                </div>
                <div>
                  <Label htmlFor="security_deposit">Security Deposit</Label>
                  <Input
                    id="security_deposit"
                    name="security_deposit"
                    type="number"
                    value={formData.security_deposit}
                    onChange={handleChange}
                    className={inputClass("security_deposit")}
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_frequency">Payment Frequency</Label>
                  <select
                    id="payment_frequency"
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
                  <Label htmlFor="payment_due_day">Payment Due Day</Label>
                  <Input
                    id="payment_due_day"
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={handleSubmit}>
            {mode === "add" ? "Add Lease" : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}
