"use client";

import { useState, ChangeEvent } from "react";
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
import { NumericInput } from "@/components/ui/numeric-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { UnitInput } from "@/components/ui/unit-input";
import { Label } from "@/components/ui/label";
import { getCurrencySymbol } from "@/lib/formattingHelpers";

// Define form state interface for better type safety
interface PropertyFormState {
  // Property Basic Information
  title: string;
  description: string;
  property_type: string;
  // Property Details
  purchase_price: number | "";
  currency: string;
  size: number | "";
  unit_system: string;
  // Property Features
  bedrooms: number | "";
  bathrooms: number | "";
  parking_spaces: number | "";
  year_built: number | "";
  // Property Address
  street: string;
  street_number: string;
  apartment_number: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

type EditPropertyDialogProps = {
  data: EnrichedProperty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
};

export default function EditPropertyDialog({
  data,
  open,
  onOpenChange,
  onSave,
}: EditPropertyDialogProps) {
  const [formData, setFormData] = useState<PropertyFormState>({
    title: data.rawProperty.title || "",
    description: data.rawProperty.description || "",
    property_type: data.rawProperty.property_type || "other",
    currency: data.rawProperty.currency || "USD",
    unit_system: data.rawProperty.unit_system || "metric",
    street: data.rawAddress?.street || "",
    street_number: data.rawAddress?.street_number || "",
    apartment_number: data.rawAddress?.apartment_number || "",
    city: data.rawAddress?.city || "",
    state: data.rawAddress?.state || "",
    country: data.rawAddress?.country || "",
    zip_code: data.rawAddress?.zip_code || "",

    purchase_price:
      data.rawProperty.purchase_price !== null
        ? data.rawProperty.purchase_price
        : "",
    size: data.rawProperty.size !== null ? data.rawProperty.size : "",
    bedrooms:
      data.rawProperty.bedrooms !== null ? data.rawProperty.bedrooms : "",
    bathrooms:
      data.rawProperty.bathrooms !== null ? data.rawProperty.bathrooms : "",
    parking_spaces:
      data.rawProperty.parking_spaces !== null
        ? data.rawProperty.parking_spaces
        : 0,
    year_built:
      data.rawProperty.year_built !== null ? data.rawProperty.year_built : "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumericChange = (name: string) => (value: number | "") => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!data.rawProperty.id || !data.rawProperty.user_id) return;

      const propertyUpdate = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        currency: formData.currency,
        unit_system: formData.unit_system,
        purchase_price:
          formData.purchase_price !== "" ? formData.purchase_price : null,
        size: formData.size !== "" ? formData.size : null,
        bedrooms: formData.bedrooms !== "" ? formData.bedrooms : null,
        bathrooms: formData.bathrooms !== "" ? formData.bathrooms : null,
        parking_spaces:
          formData.parking_spaces !== "" ? formData.parking_spaces : 0, // not nullable
        year_built: formData.year_built !== "" ? formData.year_built : null,
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
                  <Label className="mb-1">Title</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-1">Description</Label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="mb-1">Property Type</Label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {Constants.public.Enums.PROPERTY_TYPE.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <NumericInput
                    label="Year Built"
                    name="year_built"
                    value={formData.year_built === "" ? 0 : formData.year_built}
                    onChange={handleNumericChange("year_built")}
                    step={1}
                    min={1800}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="mb-1">Purchase Price</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <CurrencyInput
                        id="purchase_price"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleNumericChange("purchase_price")}
                        currency={formData.currency}
                        currencySymbol={getCurrencySymbol(formData.currency)}
                      />
                    </div>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="min-w-[100px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {currencyList().map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="mb-1">Property Size</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <UnitInput
                        name="size"
                        value={formData.size}
                        onChange={handleNumericChange("size")}
                        unitSymbol={
                          formData.unit_system === "metric" ? "m²" : "ft²"
                        }
                      />
                    </div>
                    <select
                      name="unit_system"
                      value={formData.unit_system}
                      onChange={handleChange}
                      className="min-w-[80px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="metric">m²</option>
                      <option value="imperial">ft²</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <NumericInput
                    label="Bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms === "" ? 0 : formData.bedrooms}
                    onChange={handleNumericChange("bedrooms")}
                    step={0.5}
                    min={0}
                    max={20}
                  />
                </div>
                <div>
                  <NumericInput
                    label="Bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms === "" ? 0 : formData.bathrooms}
                    onChange={handleNumericChange("bathrooms")}
                    step={0.5}
                    min={0}
                    max={20}
                  />
                </div>
                <div>
                  <NumericInput
                    label="Parking Spaces"
                    name="parking_spaces"
                    value={
                      formData.parking_spaces === ""
                        ? 0
                        : formData.parking_spaces
                    }
                    onChange={handleNumericChange("parking_spaces")}
                    step={1}
                    min={0}
                    max={20}
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
                  <Label className="mb-1">Street</Label>
                  <Input
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-1">Street Number</Label>
                  <Input
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-1">Apt. Number</Label>
                  <Input
                    name="apartment_number"
                    value={formData.apartment_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="mb-1">City</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-1">State</Label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="mb-1">Country</Label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-1">Zip Code</Label>
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
