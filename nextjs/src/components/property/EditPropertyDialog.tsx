import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSPASassClient } from "@/lib/supabase/client";
import { PropertyWithDetails } from "@/hooks/use-property-details";
import { Loader2 } from "lucide-react";

interface EditPropertyDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  property: PropertyWithDetails | null;
  onPropertyUpdated: (updatedProperty: PropertyWithDetails) => void;
}

interface EditPropertyFormState {
  title: string;
  description: string;
  property_type: string;
  property_status: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  year_built: number;
  parking_spaces: number;
  unit_system: string;
  purchase_price: number;
  currency: string;
  notes: string;
}

// Initialize form state from property data
const initializeEditPropertyForm = (
  property: PropertyWithDetails
): EditPropertyFormState => {
  return {
    title: property.title || "",
    description: property.description || "",
    property_type: property.property_type || "apartment",
    property_status: property.property_status || "vacant",
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    size: property.size || 0,
    year_built: property.year_built || new Date().getFullYear(),
    parking_spaces: property.parking_spaces || 0,
    unit_system: property.unit_system || "imperial",
    purchase_price: property.purchase_price || 0,
    currency: property.currency || "USD",
    notes: property.notes || "",
  };
};

export default function EditPropertyDialog({
  open,
  setOpen,
  property,
  onPropertyUpdated,
}: EditPropertyDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<EditPropertyFormState>({
    title: "",
    description: "",
    property_type: "apartment",
    property_status: "vacant",
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    year_built: new Date().getFullYear(),
    parking_spaces: 0,
    unit_system: "imperial",
    purchase_price: 0,
    currency: "USD",
    notes: "",
  });

  // Initialize form when property data changes or dialog opens
  useEffect(() => {
    if (property && open) {
      const initialFormState = initializeEditPropertyForm(property);
      setFormState(initialFormState);
    }
  }, [property, open]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;

    // Extract the field name from the id by removing "property-" prefix
    const fieldName = id.replace("property-", "");

    // Handle numeric fields
    if (
      [
        "bedrooms",
        "bathrooms",
        "size",
        "year_built",
        "parking_spaces",
        "purchase_price",
      ].includes(fieldName)
    ) {
      const numericValue = parseFloat(value) || 0;
      setFormState((prev) => ({
        ...prev,
        [fieldName]: numericValue,
      }));
    }
    // Handle other fields
    else {
      setFormState((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validation
      if (!formState.title) {
        toast.error("Property title is required");
        return;
      }

      if (!property?.id) {
        toast.error("No property found to update");
        return;
      }

      const supabase = await createSPASassClient();

      // Update the property in Supabase
      const { data: updatedProperty, error } = await supabase
        .from("properties")
        .update({
          title: formState.title,
          description: formState.description,
          property_type: formState.property_type,
          property_status: formState.property_status,
          bedrooms: formState.bedrooms,
          bathrooms: formState.bathrooms,
          size: formState.size,
          year_built: formState.year_built,
          parking_spaces: formState.parking_spaces,
          unit_system: formState.unit_system,
          purchase_price: formState.purchase_price,
          currency: formState.currency,
          notes: formState.notes,
        })
        .eq("id", property.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating property: ${error.message}`);
      }

      if (!updatedProperty) {
        throw new Error("Failed to update property - no data returned");
      }

      // Format the returned property to match the expected interface
      const formattedProperty: PropertyWithDetails = {
        ...property,
        ...updatedProperty,
      };

      // Success - notify parent component
      toast.success("Property updated successfully");
      onPropertyUpdated(formattedProperty);
      setOpen(false);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Standard form field component
  const FormField = ({
    id,
    label,
    value,
    type = "text",
    onChange,
    className = "",
    min,
    max,
  }: {
    id: string;
    label: string;
    value: string | number;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
  }) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <Input
          id={id}
          type={type}
          className={`bg-white/90 hover:bg-white focus:bg-white ${className}`}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
        />
      </div>
    );
  };

  // TextArea component
  const TextAreaField = ({
    id,
    label,
    value,
    onChange,
    className = "",
    rows = 3,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    rows?: number;
  }) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <Textarea
          id={id}
          className={`bg-white/90 hover:bg-white focus:bg-white ${className}`}
          value={value}
          onChange={onChange}
          rows={rows}
        />
      </div>
    );
  };

  // Select field component
  const SelectField = ({
    id,
    label,
    value,
    options,
    onChange,
  }: {
    id: string;
    label: string;
    value: string | number;
    options: { value: string | number; label: string }[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <select
          id={id}
          className="w-full p-2 border rounded-md bg-white/90 hover:bg-white focus:bg-white"
          value={value}
          onChange={onChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update the property details and information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField
            id="property-title"
            label="Property Title"
            value={formState.title}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              id="property-property_type"
              label="Property Type"
              value={formState.property_type}
              onChange={handleInputChange}
              options={[
                { value: "apartment", label: "Apartment" },
                { value: "house", label: "House" },
                { value: "duplex", label: "Duplex" },
                { value: "condo", label: "Condo" },
                { value: "commercial", label: "Commercial" },
                { value: "land", label: "Land" },
                { value: "other", label: "Other" },
              ]}
            />

            <SelectField
              id="property-property_status"
              label="Status"
              value={formState.property_status}
              onChange={handleInputChange}
              options={[
                { value: "vacant", label: "Vacant" },
                { value: "occupied", label: "Occupied" },
                { value: "maintenance", label: "Under Maintenance" },
                { value: "listed", label: "Listed" },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              id="property-bedrooms"
              label="Bedrooms"
              type="number"
              value={formState.bedrooms}
              onChange={handleInputChange}
              min="0"
            />

            <FormField
              id="property-bathrooms"
              label="Bathrooms"
              type="number"
              value={formState.bathrooms}
              onChange={handleInputChange}
              min="0"
              className="appearance-none"
            />

            <FormField
              id="property-parking_spaces"
              label="Parking Spaces"
              type="number"
              value={formState.parking_spaces}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex space-x-4">
              <FormField
                id="property-size"
                label="Size"
                type="number"
                value={formState.size}
                onChange={handleInputChange}
                min="0"
                className="flex-1"
              />

              <SelectField
                id="property-unit_system"
                label="Unit"
                value={formState.unit_system}
                onChange={handleInputChange}
                options={[
                  { value: "imperial", label: "ft²" },
                  { value: "metric", label: "m²" },
                ]}
              />
            </div>

            <FormField
              id="property-year_built"
              label="Year Built"
              type="number"
              value={formState.year_built}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear().toString()}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <SelectField
                id="property-currency"
                label="Currency"
                value={formState.currency}
                onChange={handleInputChange}
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "GBP", label: "GBP (£)" },
                  { value: "NIS", label: "NIS (₪)" },
                  { value: "CAD", label: "CAD (C$)" },
                  { value: "AUD", label: "AUD (A$)" },
                ]}
              />
            </div>

            <div className="col-span-3">
              <FormField
                id="property-purchase_price"
                label="Purchase Price"
                type="number"
                value={formState.purchase_price}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <TextAreaField
            id="property-description"
            label="Description"
            value={formState.description}
            onChange={handleInputChange}
            rows={3}
          />

          <TextAreaField
            id="property-notes"
            label="Private Notes"
            value={formState.notes}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Updating..." : "Update Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
