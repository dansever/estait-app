"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";

export default function AddPropertyPage() {
  const { user } = useGlobal();
  const [form, setForm] = useState({
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
    apartment_number: "",
    city: "",
    state: "",
    country: "",
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

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = await createSPASassClient();
      const newProperty = await supabase.createProperty(user.id, {
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
      });

      if (!newProperty?.id) throw new Error("Property creation failed");

      await supabase.createAddress({
        property_id: newProperty.id,
        street: form.street,
        apartment_number: form.apartment_number,
        city: form.city,
        state: form.state,
        country: form.country,
      });

      setSuccess(true);
      setForm({
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
        apartment_number: "",
        city: "",
        state: "",
        country: "",
      });
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

      {/* Property Form */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details & Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Description", name: "description", type: "text" },
            {
              label: "Property Type",
              name: "property_type",
              type: "select",
              options: Constants.public.Enums.PROPERTY_TYPE,
            },
            { label: "Purchase Price", name: "purchase_price", type: "number" },
            {
              label: "Currency",
              name: "currency",
              type: "select",
              options: currencyList().map((c) => c.code),
            },
            { label: "Size", name: "size", type: "number" },
            {
              label: "Unit System",
              name: "unit_system",
              type: "select",
              options: ["metric", "imperial"],
            },
            { label: "Bedrooms", name: "bedrooms", type: "number" },
            { label: "Bathrooms", name: "bathrooms", type: "number" },
            { label: "Parking Spaces", name: "parking_spaces", type: "number" },
            { label: "Year Built", name: "year_built", type: "number" },
            { label: "Street", name: "street", type: "text" },
            { label: "Apt. Number", name: "apartment_number", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "State", name: "state", type: "text" },
            { label: "Country", name: "country", type: "text" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="text-sm font-medium mb-1">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 text-sm"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
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
