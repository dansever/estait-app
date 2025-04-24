import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";
import { getCurrencySymbol } from "@/lib/formattingHelpers";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { LeaseRow } from "@/lib/enrichedPropertyType";

export type LeaseFormData = {
  rent_amount: number | "";
  currency: string;
  lease_start: string;
  lease_end: string;
  payment_frequency: string;
  payment_due_day: number;
  security_deposit: number | "";
  is_lease_active: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type LeaseFormProps = {
  mode: "add" | "edit";
  leaseToEdit?: LeaseRow | null;
  activeLease: LeaseRow | null;
  allPastLeases: LeaseRow[];
  initialData?: LeaseFormData;
  onSubmit: (data: LeaseFormData) => void;
  errorMessage?: string;
  setErrorMessage: (msg: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
};

export default function LeaseForm({
  mode,
  initialData,
  onSubmit,
  errorMessage,
  setErrorMessage,
  isLoading = false,
}: LeaseFormProps) {
  const [formData, setFormData] = useState<LeaseFormData>(
    initialData || {
      rent_amount: "",
      currency: "USD",
      lease_start: "",
      lease_end: "",
      payment_frequency: "monthly",
      payment_due_day: 1,
      security_deposit: "",
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
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Clear any previous error message when user is making changes
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const currencySymbol = getCurrencySymbol(formData.currency);

  const validateForm = (): boolean => {
    const requiredFields = ["rent_amount", "lease_start", "lease_end"];
    const newErrors: { [key: string]: boolean } = {};
    let isValid = true;

    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof LeaseFormData]) {
        newErrors[field] = true;
        isValid = false;
      }
    }

    // Validate numeric fields are positive
    const numericFields = [
      "rent_amount",
      "security_deposit",
      "payment_due_day",
    ];
    for (const field of numericFields) {
      const value = formData[field as keyof LeaseFormData];
      if (value !== undefined && value !== "" && Number(value) < 0) {
        newErrors[field] = true;
        isValid = false;
      }
    }

    // Validate dates
    if (formData.lease_start && formData.lease_end) {
      const startDate = new Date(formData.lease_start);
      const endDate = new Date(formData.lease_end);
      if (endDate <= startDate) {
        newErrors["lease_end"] = true;
        isValid = false;
      }
    }

    // Update form errors
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Only set error if one doesn't already exist
      if (!errorMessage) {
        setErrorMessage("Please fix all errors before submitting.");
      }
      return;
    }

    setErrorMessage("");
    onSubmit(formData);
  };

  return (
    <>
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
                  className={`focus:ring-primary ${inputClass("first_name")}`}
                  disabled={isLoading}
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
                  className={`focus:ring-primary ${inputClass("last_name")}`}
                  disabled={isLoading}
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
                  className={`focus:ring-primary ${inputClass("email")}`}
                  disabled={isLoading}
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
                  className={`focus:ring-primary ${inputClass("phone")}`}
                  disabled={isLoading}
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
                    Lease Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lease_start"
                    name="lease_start"
                    type="date"
                    value={formData.lease_start}
                    onChange={handleChange}
                    className={`focus:ring-primary ${inputClass(
                      "lease_start"
                    )}`}
                    disabled={isLoading}
                    required
                  />
                  {formErrors.lease_start && (
                    <p className="text-destructive text-xs mt-1">
                      Start date is required
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lease_end" className="mb-1 block">
                    Lease End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lease_end"
                    name="lease_end"
                    type="date"
                    value={formData.lease_end}
                    onChange={handleChange}
                    min={minEndDate}
                    className={`focus:ring-primary ${inputClass("lease_end")}`}
                    disabled={isLoading}
                    required
                  />
                  {formErrors.lease_end && (
                    <p className="text-destructive text-xs mt-1">
                      End date must be after start date
                    </p>
                  )}
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
                    disabled={isLoading}
                  >
                    {currencyList().map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="rent_amount" className="mb-1 block">
                    Rent Amount <span className="text-red-500">*</span>
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
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {formErrors.rent_amount && (
                    <p className="text-destructive text-xs mt-1">
                      Valid rent amount is required
                    </p>
                  )}
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
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.security_deposit && (
                    <p className="text-destructive text-xs mt-1">
                      Security deposit cannot be negative
                    </p>
                  )}
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
                    disabled={isLoading}
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
                    disabled={
                      formData.payment_frequency !== "monthly" || isLoading
                    }
                  />
                  {formErrors.payment_due_day && (
                    <p className="text-destructive text-xs mt-1">
                      Day must be between 1-31
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-row justify-end space-x-3 mt-2">
          <Button variant="default" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : mode === "add" ? (
              "Add Lease"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
