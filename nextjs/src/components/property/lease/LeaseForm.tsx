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
  onCancel?: () => void;
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
  const [minEndDate, setMinEndDate] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const { lease_start, lease_end } = formData;

    // Set minimum end date to one day after lease_start
    if (lease_start) {
      const startDate = new Date(lease_start);
      startDate.setDate(startDate.getDate() + 1);
      setMinEndDate(startDate.toISOString().split("T")[0]);

      // Auto-correct end date if it's before or same as start
      if (lease_end && new Date(lease_end) <= new Date(lease_start)) {
        setFormData((prev) => ({
          ...prev,
          lease_end: startDate.toISOString().split("T")[0],
        }));
      }
    }

    // Compare only dates, ignore time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = lease_start ? new Date(lease_start) : null;
    const end = lease_end ? new Date(lease_end) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    const isActive = start && end && start <= today && today <= end;
    setFormData((prev) => ({
      ...prev,
      is_lease_active: Boolean(isActive),
    }));
  }, [formData.lease_start, formData.lease_end]);

  const inputClass = (field: string) =>
    formErrors[field] ? "border-destructive bg-destructive/10" : "";

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

    if (new Date(formData.lease_end) <= new Date(formData.lease_start)) {
      setErrorMessage("Lease end date must be after start date.");
      return;
    }

    setErrorMessage("");
    onSubmit(formData);
  };

  // Get currency symbol for the selected currency
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencyList().find((c) => c.code === currencyCode);
    return currency?.symbol || "$";
  };

  const currencySymbol = getCurrencySymbol(formData.currency);

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 py-4">
        {/* Tenant Info */}
        <Card className="shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="mb-1 block">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="mb-1 block">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-1 block">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Details */}
        <Card className="shadow-sm hover:shadow transition-shadow duration-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Lease Details</h3>
            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lease_start" className="mb-1 block">
                    Lease Start Date
                  </Label>
                  <Input
                    id="lease_start"
                    name="lease_start"
                    type="date"
                    value={formData.lease_start}
                    onChange={handleChange}
                    className="focus:ring-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="lease_end" className="mb-1 block">
                    Lease End Date
                  </Label>
                  <Input
                    id="lease_end"
                    name="lease_end"
                    type="date"
                    value={formData.lease_end}
                    onChange={handleChange}
                    min={minEndDate}
                    className="focus:ring-primary"
                  />
                </div>
              </div>

              {/* Money Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency" className="mb-1 block">
                    Currency
                  </Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-primary focus:border-primary"
                  >
                    {currencyList().map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="rent_amount" className="mb-1 block">
                    Rent Amount
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">{currencySymbol}</span>
                    </div>
                    <Input
                      id="rent_amount"
                      name="rent_amount"
                      type="number"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className={`pl-7 ${inputClass("rent_amount")}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="security_deposit" className="mb-1 block">
                    Security Deposit
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">{currencySymbol}</span>
                    </div>
                    <Input
                      id="security_deposit"
                      name="security_deposit"
                      type="number"
                      value={formData.security_deposit}
                      onChange={handleChange}
                      className={`pl-7 ${inputClass("security_deposit")}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_frequency" className="mb-1 block">
                    Payment Frequency
                  </Label>
                  <select
                    id="payment_frequency"
                    name="payment_frequency"
                    value={formData.payment_frequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-primary focus:border-primary"
                  >
                    {Constants.public.Enums.PAYMENT_FREQUENCY.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="payment_due_day" className="mb-1 block">
                    Payment Due Day
                  </Label>
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

        <div className="flex flex-row justify-end space-x-3 mt-2">
          <Button variant="default" onClick={handleSubmit}>
            {mode === "add" ? "Add Lease" : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}
