import { useState } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formatCurrency } from "@/lib/formattingHelpers";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditPropertyDialog from "@/components/property/EditPropertyDialog";
import { createSPASassClient } from "@/lib/supabase/client";

export default function Overview({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const { rawProperty, rawAddress } = data;
  const [isEditOpen, setIsEditOpen] = useState(false);

  const onDeleteProperty = async () => {
    const confirmed = confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;

    const supabase = await createSPASassClient();
    const client = supabase.getSupabaseClient();

    // Get user
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      alert("User not authenticated.");
      return;
    }

    const success = await supabase.deleteProperty(user.id, rawProperty.id);
    if (success) {
      window.location.href = "/app/properties";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={() => setIsEditOpen(true)}>
          <Pencil />
          Edit
        </Button>
        <Button
          variant="outlineDestructive"
          size="lg"
          onClick={onDeleteProperty}
        >
          <Trash2 />
          Delete
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Property Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Description:</strong> {rawProperty.description || "—"}
            </p>
            <p>
              <strong>Type:</strong> {rawProperty.property_type || "—"}
            </p>
            <p>
              <strong>Purchase Price: </strong>

              {formatCurrency(rawProperty.purchase_price, rawProperty.currency)}
            </p>

            <p>
              <strong>Size:</strong>{" "}
              {rawProperty.size
                ? `${rawProperty.size} ${
                    rawProperty.unit_system === "metric" ? "m²" : "sq ft"
                  }`
                : "N/A"}
            </p>
            <p>
              <strong>Bedrooms:</strong> {rawProperty.bedrooms ?? "N/A"}
            </p>
            <p>
              <strong>Bathrooms:</strong> {rawProperty.bathrooms ?? "N/A"}
            </p>
            <p>
              <strong>Parking Spaces:</strong> {rawProperty.parking_spaces ?? 0}
            </p>
            <p>
              <strong>Year Built:</strong> {rawProperty.year_built ?? "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Property Address Card */}
        <Card>
          <CardHeader>
            <CardTitle>Property Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Address:</strong>{" "}
              {rawAddress
                ? `${rawAddress.street}, ${rawAddress.city}, ${rawAddress.country}`
                : "Not set"}
            </p>

            {rawAddress && (
              <div className="mt-2 rounded-lg overflow-hidden shadow-md border">
                <iframe
                  title="Property Location"
                  width="100%"
                  height="250"
                  loading="lazy"
                  style={{ border: 0 }}
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  }&q=${encodeURIComponent(
                    `${rawAddress.street}, ${rawAddress.city}, ${rawAddress.country}`
                  )}`}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        data={data}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={refreshData} // pass refresh to dialog
      />
    </div>
  );
}
