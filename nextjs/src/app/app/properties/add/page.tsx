"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProperty } from "@/lib/supabase/queries/properties";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Lock,
  Unlock,
  Check,
} from "lucide-react";

// Property form schema
const propertyFormSchema = z.object({
  // Property information
  title: z.string().min(1, "Property title is required"),
  description: z.string().optional(),
  property_type: z.enum([
    "apartment",
    "house",
    "duplex",
    "condo",
    "commercial",
    "land",
    "other",
  ]),
  property_status: z.enum(["vacant", "occupied", "maintenance", "listed"]),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(0).optional(),
  year_built: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  parking_spaces: z.coerce.number().int().min(0).default(0),
  unit_system: z.enum(["imperial", "metric"]).default("imperial"),
  purchase_price: z.coerce.number().min(0).optional(),
  currency: z.string().min(1, "Currency is required"),

  // Address information
  street: z.string().min(1, "Street address is required"),
  apartment_number: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zip_code: z.string().min(1, "Postal/ZIP code is required"),
  country: z.string().min(1, "Country is required"),

  // Additional details
  notes: z.string().optional(),
});

// Schema just for the first section validation
const propertyDetailsSchema = propertyFormSchema.pick({
  title: true,
  property_type: true,
  property_status: true,
  bedrooms: true,
  bathrooms: true,
  size: true,
  year_built: true,
  parking_spaces: true,
  unit_system: true,
  purchase_price: true,
  currency: true,
  description: true,
  notes: true,
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionOneValid, setSectionOneValid] = useState(false);
  const [addressSectionExpanded, setAddressSectionExpanded] = useState(false);
  const supabase = createClientComponentClient();

  // Initialize form with default values
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      property_type: "apartment",
      property_status: "vacant",
      bedrooms: undefined,
      bathrooms: undefined,
      size: undefined,
      year_built: undefined,
      parking_spaces: 0,
      unit_system: "imperial",
      purchase_price: undefined,
      currency: "USD",
      street: "",
      apartment_number: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      notes: "",
    },
  });

  // Watch for changes to validate the first section
  const formValues = form.watch();

  useEffect(() => {
    const validateSection = async () => {
      try {
        // Extract only the first section fields
        const sectionOneData = {
          title: formValues.title,
          property_type: formValues.property_type,
          property_status: formValues.property_status,
          bedrooms: formValues.bedrooms,
          bathrooms: formValues.bathrooms,
          size: formValues.size,
          year_built: formValues.year_built,
          parking_spaces: formValues.parking_spaces,
          unit_system: formValues.unit_system,
          purchase_price: formValues.purchase_price,
          currency: formValues.currency,
          description: formValues.description,
          notes: formValues.notes,
        };

        // Parse the data against the section schema
        const result = propertyDetailsSchema.safeParse(sectionOneData);
        setSectionOneValid(result.success);
      } catch (error) {
        setSectionOneValid(false);
      }
    };

    validateSection();
  }, [formValues]);

  // Toggle address section
  const toggleAddressSection = () => {
    if (sectionOneValid) {
      setAddressSectionExpanded(!addressSectionExpanded);
    } else {
      // If tried to expand but section one isn't valid, show validation errors
      form.trigger(["title", "property_type", "currency"]);
      toast.error("Please complete the required property details first");
    }
  };

  async function onSubmit(data: PropertyFormValues) {
    if (!user?.id) {
      toast.error("You must be logged in to add a property");
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the address record
      let addressId = null;

      if (data.street) {
        const { data: addressData, error: addressError } = await supabase
          .from("addresses")
          .insert({
            street: data.street,
            apartment_number: data.apartment_number,
            city: data.city,
            state: data.state,
            zip_code: data.zip_code,
            country: data.country,
          })
          .select()
          .single();

        if (addressError) throw addressError;
        if (addressData) {
          addressId = addressData.id;
        }
      }

      // Then create the property with the address ID
      const propertyData = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        property_status: data.property_status,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        size: data.size,
        year_built: data.year_built,
        parking_spaces: data.parking_spaces,
        unit_system: data.unit_system,
        purchase_price: data.purchase_price,
        currency: data.currency,
        address_id: addressId,
        notes: data.notes,
        owner_id: user.id,
        image_ids: [],
        document_ids: [],
      };

      const property = await createProperty(propertyData);

      toast.success("Property added successfully");

      // Redirect to the property details page
      router.push(`/app/properties/${property.id}`);
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currencies = [
    { label: "USD - US Dollar", value: "USD", symbol: "$" },
    { label: "EUR - Euro", value: "EUR", symbol: "€" },
    { label: "GBP - British Pound", value: "GBP", symbol: "£" },
    { label: "CAD - Canadian Dollar", value: "CAD", symbol: "$" },
    { label: "AUD - Australian Dollar", value: "AUD", symbol: "$" },
    { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥" },
    { label: "CNY - Chinese Yuan", value: "CNY", symbol: "¥" },
    { label: "INR - Indian Rupee", value: "INR", symbol: "₹" },
    { label: "ILS - Israeli Shekel", value: "ILS", symbol: "₪" },
  ];

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Property</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Property Details Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xl flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Property Details
                <Badge variant="outline" className="ml-2 font-normal text-xs">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a descriptive title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="commercial">
                              Commercial
                            </SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="property_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vacant">Vacant</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="maintenance">
                              Under Maintenance
                            </SelectItem>
                            <SelectItem value="listed">
                              Listed for Rent/Sale
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property characteristics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parking_spaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parking</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year_built"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1800"
                            max={new Date().getFullYear()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Size and units */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="unit_system"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit System</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit system" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="imperial">
                                Imperial (ft²)
                              </SelectItem>
                              <SelectItem value="metric">
                                Metric (m²)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Financial information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="150000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem
                                key={currency.value}
                                value={currency.value}
                              >
                                {currency.symbol} {currency.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the property features, amenities, etc."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A helpful description that will be shown to potential
                        tenants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add your personal notes about this property (not visible to tenants)"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        For your own records - will not be shown publicly
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={toggleAddressSection}
                  disabled={!sectionOneValid}
                >
                  {sectionOneValid ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Continue to Address Information
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Property Details First
                    </>
                  )}
                </Button>

                {sectionOneValid && (
                  <div className="text-center text-sm text-green-600 font-medium">
                    <Check className="h-4 w-4 inline mr-1" />
                    Property details completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card
            className={cn(
              "transition-all duration-500 overflow-hidden",
              !addressSectionExpanded && "opacity-70"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xl flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
                <Badge variant="outline" className="ml-2 font-normal text-xs">
                  Required
                </Badge>
              </CardTitle>
              {addressSectionExpanded && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAddressSection}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>

            <CardContent
              className={cn(
                "space-y-4 transition-all duration-300",
                !addressSectionExpanded && "h-0 p-0 opacity-0",
                addressSectionExpanded && "h-auto opacity-100"
              )}
            >
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apartment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apartment/Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province*</FormLabel>
                      <FormControl>
                        <Input placeholder="California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/ZIP Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="94103" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !addressSectionExpanded}
            >
              {isSubmitting ? "Adding Property..." : "Add Property"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
