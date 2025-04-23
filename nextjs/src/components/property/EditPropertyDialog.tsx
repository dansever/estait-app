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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Constants } from "@/lib/types";
import { currencyList } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { createSPASassClient } from "@/lib/supabase/client";
import AddressInput from "@/components/property/GoogleAddressInput";

type EditPropertyDialogProps = {
  data: EnrichedProperty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void; // new
};

export default function EditPropertyDialog({
  data,
  open,
  onOpenChange,
  onSave,
}: EditPropertyDialogProps) {
  const [formData, setFormData] = React.useState({
    title: data.rawProperty.title || "",
    description: data.rawProperty.description || "",
    property_type: data.rawProperty.property_type || "other",
    purchase_price: data.rawProperty.purchase_price || 0,
    currency: data.rawProperty.currency || "USD",
    size: Math.max(0, data.rawProperty.size || 0),
    unit_system: data.rawProperty.unit_system || "metric",
    bedrooms: Math.max(0, data.rawProperty.bedrooms || 0),
    bathrooms: Math.max(0, data.rawProperty.bathrooms || 0),
    parking_spaces: Math.max(0, data.rawProperty.parking_spaces || 0),
    year_built: Math.max(0, Number(data.rawProperty.year_built)) || 0,
    street: data.rawAddress?.street || "",
    street_number: data.rawAddress?.street_number || "",
    apartment_number: data.rawAddress?.apartment_number || "",
    city: data.rawAddress?.city || "",
    state: data.rawAddress?.state || "",
    country: data.rawAddress?.country || "",
    zip_code: data.rawAddress?.zip_code || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleSave = async () => {
    try {
      if (!data.rawProperty.id || !data.rawProperty.user_id) return;

      const propertyUpdate = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        purchase_price: Number(formData.purchase_price),
        currency: formData.currency,
        size: Number(formData.size),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        parking_spaces: Number(formData.parking_spaces),
        year_built: Number(formData.year_built),
      };

      const addressUpdate = {
        street: formData.street,
        street_number: formData.street_number,
        apartment_number: formData.apartment_number,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip_code: formData.zip_code,
      };

      const supabase = await createSPASassClient();

      await supabase.updateProperty(
        data.rawProperty.user_id,
        data.rawProperty.id,
        propertyUpdate
      );

      const updatedAddress = await supabase.updateAddress(
        data.rawAddress.id,
        addressUpdate
      );
      console.log("Updated address:", updatedAddress);

      // Optionally show success message here
      await onSave(); // refetch full data
      onOpenChange(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <VisuallyHidden>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Edit property & address details</DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <DialogContent className="max-w-2xl">
        <div className="grid grid-cols-1 gap-6 py-4">
          {/* Property Details */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Edit Property Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-2"
                  >
                    {Constants.public.Enums.PROPERTY_TYPE.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Year Built
                  </label>
                  <Input
                    name="year_built"
                    type="number"
                    value={formData.year_built}
                    onChange={handleChange}
                    step={1}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex gap-2">
                  <Input
                    name="purchase_price"
                    type="number"
                    value={formData.purchase_price}
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
                <div className="flex gap-2">
                  <Input
                    name="size"
                    type="number"
                    value={formData.size}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <select
                    name="unit_system"
                    value={formData.unit_system}
                    onChange={handleChange}
                    className="min-w-[100px] px-2 py-2 border rounded"
                  >
                    <option value="metric">m²</option>
                    <option value="imperial">ft²</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bedrooms
                  </label>
                  <Input
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    step={0.5}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bathrooms
                  </label>
                  <Input
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    step={0.5}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parking Spaces
                  </label>
                  <Input
                    name="parking_spaces"
                    type="number"
                    value={formData.parking_spaces}
                    onChange={handleChange}
                    step={1}
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Address */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Edit Property Address
              </h3>

              <AddressInput
                name="Property Address"
                defaultValue={formData.street}
                placeholder="Start typing the address..."
                required
                onSelect={(place) =>
                  setFormData((prev) => ({
                    ...prev,
                    street: place.street || "",
                    street_number: place.street_number || "",
                    apartment_number: place.apartment_number || "",
                    city: place.city || "",
                    state: place.state || "",
                    country: place.country || "",
                    zip_code: place.zip_code || "",
                  }))
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Street
                  </label>
                  <Input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Street Number
                  </label>
                  <Input
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Apt. Number
                  </label>
                  <Input
                    name="apartment_number"
                    value={formData.apartment_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Zip Code
                  </label>
                  <Input
                    name="zip_code"
                    value={formData.zip_code}
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
