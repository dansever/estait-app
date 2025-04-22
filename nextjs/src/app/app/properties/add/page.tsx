"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";
import AddressInput from "@/components/property/GoogleAddressInput";

export default function AddPropertyPage() {
  const { user } = useGlobal();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "house",
    purchase_price: 0,
    currency: "USD",
    size: 0,
    unit_system: "metric",
    bedrooms: 0,
    bathrooms: 0,
    parking_spaces: 0,
    year_built: 0,
    street: "",
    street_number: 0,
    apartment_number: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: [
        "purchase_price",
        "size",
        "bedrooms",
        "bathrooms",
        "parking_spaces",
        "year_built",
      ].includes(name)
        ? Math.max(0, Number(value))
        : value,
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
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = await createSPASassClient();
      // 1. Create address first
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

      // 2. Then create property with address_id
      const newProperty = await supabase.createProperty(user.id, {
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        purchase_price: form.purchase_price,
        currency: form.currency,
        size: form.size,
        unit_system: form.unit_system,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        parking_spaces: form.parking_spaces,
        year_built: form.year_built,
        address_id: address.id, // link property to address
      });

      if (!newProperty?.id) throw new Error("Property creation failed");
      router.push("/app/properties?success=1"); //  redirect after creation
    } catch (err) {
      console.error(err);
      setError("Failed to add property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Add New Property</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Property added successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Property Details & Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <InputField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
          <SelectField
            label="Property Type"
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            options={Constants.public.Enums.PROPERTY_TYPE}
          />
          <InputField
            label="Purchase Price"
            name="purchase_price"
            type="number"
            value={form.purchase_price}
            onChange={handleChange}
          />
          <SelectField
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            options={currencyList().map((c) => c.code)}
          />
          <InputField
            label="Size"
            name="size"
            type="number"
            value={form.size}
            onChange={handleChange}
          />
          <SelectField
            label="Unit System"
            name="unit_system"
            value={form.unit_system}
            onChange={handleChange}
            options={["metric", "imperial"]}
          />
          <InputField
            label="Bedrooms"
            name="bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={handleChange}
          />
          <InputField
            label="Bathrooms"
            name="bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={handleChange}
          />
          <InputField
            label="Parking Spaces"
            name="parking_spaces"
            type="number"
            value={form.parking_spaces}
            onChange={handleChange}
          />
          <InputField
            label="Year Built"
            name="year_built"
            type="number"
            value={form.year_built}
            onChange={handleChange}
          />

          <AddressInput
            name="Property Address"
            defaultValue={form.street}
            placeholder="Enter your property address"
            required
            onSelect={handleAddressSelect}
          />
          <InputField
            label="Street"
            name="streetr"
            value={form.street}
            onChange={handleChange}
          />
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
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />
          <InputField
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
          />
          <InputField
            label="Zip Code"
            name="zip_code"
            value={form.zip_code}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Add Property"}
        </Button>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium mb-1">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: any) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
