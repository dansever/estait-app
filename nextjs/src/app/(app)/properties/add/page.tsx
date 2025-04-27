"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Building,
  MapPin,
  Home,
  Calendar,
  User,
  Car,
  Toilet,
} from "lucide-react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";
import AddressInput from "@/components/property/GoogleAddressInput";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { UnitInput } from "@/components/ui/unit-input";
import { getCurrencySymbol } from "@/lib/formattingHelpers";

export default function AddPropertyPage() {
  const { user } = useGlobal();
  const router = useRouter();
  const [form, setForm] = useState({
    // Property Basic Information
    title: "",
    description: "",
    property_type: "house",
    // Property Details
    purchase_price: "" as number | "",
    currency: "USD",
    size: "" as number | "",
    unit_system: "metric",
    //Property Features
    bedrooms: "" as number | "",
    bathrooms: "" as number | "",
    parking_spaces: "" as number | "",
    year_built: "" as number | "",
    // Property Address
    street: "",
    street_number: "",
    apartment_number: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState("details");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});

  // Auto-dismiss error/success message after 5 seconds
  useEffect(() => {
    if (!error && !success) return;
    const timer = setTimeout(() => {
      if (error) setError("");
      if (success) setSuccess(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumericChange = (name: string) => (value: number | "") => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSelect = (place: any) => {
    setForm((prev) => ({
      ...prev,
      street: place.street || "",
      street_number: place.street_number,
      apartment_number: place.apartment_number || "",
      city: place.city || "",
      state: place.state || "",
      country: place.country || "",
      zip_code: place.zip_code || "",
    }));
    setActiveSection("address");
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: boolean } = {};
    let isValid = true;

    if (!form.title) {
      errors.title = true;
      isValid = false;
    }

    if (!form.property_type) {
      errors.property_type = true;
      isValid = false;
    }

    if (!form.street || !form.city || !form.country) {
      errors.address = true;
      isValid = false;
    }

    setValidationErrors(errors);

    if (!isValid) {
      setError("Please fill out all required fields before submitting.");
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = await createSPASassClient();
      const { data: address, error: addressError } = await supabase.client
        .from("addresses")
        .insert({
          street: form.street,
          street_number: form.street_number,
          apartment_number: form.apartment_number,
          city: form.city,
          state: form.state,
          country: form.country,
          zip_code: form.zip_code,
        })
        .select()
        .single();

      if (addressError || !address?.id) throw addressError;

      const newProperty = await supabase.createProperty(user.id, {
        // Property Basic Information
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        // Property Details
        purchase_price: form.purchase_price !== "" ? form.purchase_price : 0,
        currency: form.currency,
        size: form.size !== "" ? form.size : 0,
        unit_system: form.unit_system,
        address_id: address.id,
        // Property Features
        bedrooms: form.bedrooms !== "" ? form.bedrooms : 0,
        bathrooms: form.bathrooms !== "" ? form.bathrooms : 0,
        parking_spaces: form.parking_spaces !== "" ? form.parking_spaces : 0,
        year_built: form.year_built !== "" ? form.year_built : 0,
      });

      if (!newProperty?.id) throw new Error("Property creation failed");
      router.push("/properties?success=1");
    } catch (err) {
      console.error(err);
      setError("Failed to add property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-10 px-4 md:px-6">
      <h1 className="text-3xl font-heading font-semibold text-primary-800 mb-8">
        Add New Property
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Property added successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with steps */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card
              className={`cursor-pointer transition-all ${
                activeSection === "details"
                  ? "border-primary-400 shadow-md bg-primary-50"
                  : "hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setActiveSection("details")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-full ${
                      activeSection === "details"
                        ? "bg-primary-200 text-primary-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        activeSection === "details"
                          ? "text-primary-800"
                          : "text-gray-700"
                      }`}
                    >
                      Property Details
                    </p>
                    <p className="text-sm text-gray-500">
                      Basic information, type & features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                activeSection === "address"
                  ? "border-primary-400 shadow-md bg-primary-50"
                  : "hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setActiveSection("address")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-full ${
                      activeSection === "address"
                        ? "bg-primary-200 text-primary-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        activeSection === "address"
                          ? "text-primary-800"
                          : "text-gray-700"
                      }`}
                    >
                      Location & Address
                    </p>
                    <p className="text-sm text-gray-500">
                      Where your property is located
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main form */}
        <div className="lg:col-span-2">
          {activeSection === "details" && (
            <Card className="border-0 shadow-md overflow-hidden bg-white">
              <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-secondary-50 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-primary-800">
                  <Building className="h-5 w-5 text-primary-600" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  Enter the basic information about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Property Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Beach House, Downtown Apartment, etc."
                      icon={<Home className="h-4 w-4 text-gray-400" />}
                      required
                      error={validationErrors.title}
                    />
                    <SelectField
                      label="Property Type"
                      name="property_type"
                      value={form.property_type}
                      onChange={handleChange}
                      options={Constants.public.Enums.PROPERTY_TYPE}
                      icon={<Building className="h-4 w-4 text-gray-400" />}
                      required
                      error={validationErrors.property_type}
                    />
                  </div>
                  <div className="col-span-full">
                    <TextareaField
                      label="Description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your property..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2">
                    Property Details
                  </h3>
                  {/* TODO - manually insert numeric values in form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <CurrencyInput
                          id="purchase_price"
                          name="purchase_price"
                          label="Purchase Price"
                          value={form.purchase_price}
                          onChange={handleNumericChange("purchase_price")}
                          currency={form.currency}
                          currencySymbol={getCurrencySymbol(form.currency)}
                        />
                      </div>
                      <div className="w-1/3">
                        <SelectField
                          label="Currency"
                          name="currency"
                          value={form.currency}
                          onChange={handleChange}
                          options={currencyList().map((c) => c.code)}
                          labelFormatter={(code) => {
                            const currency = currencyList().find(
                              (c) => c.code === code
                            );
                            return currency ? currency.label : code;
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <UnitInput
                          id="size"
                          name="size"
                          label="Property Size"
                          value={form.size}
                          onChange={handleNumericChange("size")}
                          unitSymbol={
                            form.unit_system === "metric" ? "m²" : "ft²"
                          }
                        />
                      </div>
                      <div className="w-1/3">
                        <SelectField
                          label="Unit"
                          name="unit_system"
                          value={form.unit_system}
                          onChange={handleChange}
                          options={["metric", "imperial"]}
                          labelFormatter={(opt) =>
                            opt === "metric" ? "m²" : "ft²"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2">
                    Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Bedrooms */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="bedrooms"
                        className="text-sm font-medium text-gray-700"
                      >
                        Bedrooms
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <NumericInput
                          id="bedrooms"
                          name="bedrooms"
                          value={form.bedrooms === "" ? 0 : form.bedrooms}
                          onChange={handleNumericChange("bedrooms")}
                          className="pl-10"
                          step={0.5}
                          min={0}
                          max={20}
                        />
                      </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="bathrooms"
                        className="text-sm font-medium text-gray-700"
                      >
                        Bathrooms
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <Toilet className="h-4 w-4 text-gray-400" />
                        </div>
                        <NumericInput
                          id="bathrooms"
                          name="bathrooms"
                          value={form.bathrooms === "" ? 0 : form.bathrooms}
                          onChange={handleNumericChange("bathrooms")}
                          className="pl-10"
                          step={0.5}
                          min={0}
                          max={20}
                        />
                      </div>
                    </div>

                    {/* Parking Spaces */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="parking_spaces"
                        className="text-sm font-medium text-gray-700"
                      >
                        Parking Spaces
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <Car className="h-4 w-4 text-gray-400" />
                        </div>
                        <NumericInput
                          id="parking_spaces"
                          name="parking_spaces"
                          value={
                            form.parking_spaces === "" ? 0 : form.parking_spaces
                          }
                          onChange={handleNumericChange("parking_spaces")}
                          className="pl-10"
                          step={1}
                          min={0}
                          max={20}
                        />
                      </div>
                    </div>

                    {/* Year Built */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="year_built"
                        className="text-sm font-medium text-gray-700"
                      >
                        Year Built
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <NumericInput
                          id="year_built"
                          name="year_built"
                          value={form.year_built === "" ? 0 : form.year_built}
                          onChange={handleNumericChange("year_built")}
                          className="pl-10"
                          step={1}
                          min={1800}
                          max={new Date().getFullYear() + 10}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <div></div>
                  <Button
                    onClick={() => setActiveSection("address")}
                    className="gap-2"
                    size="lg"
                  >
                    Continue to Address
                    <MapPin className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "address" && (
            <Card className="border-0 shadow-md overflow-hidden bg-white">
              <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-secondary-50 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-primary-800">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Property Location
                </CardTitle>
                <CardDescription>
                  Enter the address details of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2">
                    Search Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <AddressInput
                      name="Property Address"
                      defaultValue={form.street}
                      placeholder="Start typing your property address..."
                      required
                      onSelect={handleAddressSelect}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 border-b pb-2">
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Street"
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      required
                      error={validationErrors.address}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Street Number"
                        name="street_number"
                        value={form.street_number}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Apt. Number"
                        name="apartment_number"
                        value={form.apartment_number}
                        onChange={handleChange}
                      />
                    </div>
                    <InputField
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      error={validationErrors.address}
                    />
                    <InputField
                      label="State/Province"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      error={validationErrors.address}
                    />
                    <InputField
                      label="Zip/Postal Code"
                      name="zip_code"
                      value={form.zip_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection("details")}
                    className="gap-2 border-gray-200"
                  >
                    <Building className="h-4 w-4 mr-1" />
                    Back to Details
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="gap-2 bg-primary-600 hover:bg-primary-700"
                    size="lg"
                  >
                    {loading ? "Saving..." : "Add Property"}
                    {!loading && <CheckCircle className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon = null,
  required = false,
  error = false,
}: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${icon ? "pl-10" : ""} ${
            error ? "border-red-500 bg-red-50" : ""
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  icon = null,
  required = false,
  error = false,
  labelFormatter = (opt: string) =>
    opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, " "),
}: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {icon}
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500 bg-red-50" : ""}`}
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {labelFormatter(opt)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
}: any) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
      />
    </div>
  );
}
