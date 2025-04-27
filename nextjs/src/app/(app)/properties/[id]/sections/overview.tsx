import { useState, useRef } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formattingHelpers";
import {
  Pencil,
  Trash2,
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Calendar,
  Ruler,
  Quote,
  Copy,
  Check,
  Boxes,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EditPropertyDialog from "@/components/property/EditPropertyDialog";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingThreeDotsJumping from "@/components/general/LoadingJumpingDots";

export default function Overview({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const { rawProperty, rawAddress } = data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteProperty = async () => {
    setIsDeleting(true);
    try {
      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      // Get user
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        alert("User not authenticated.");
        setIsDeleting(false);
        return;
      }

      const success = await supabase.deleteProperty(user.id, rawProperty.id);
      if (success) {
        window.location.href = "/properties";
      } else {
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      setIsDeleting(false);
    }
  };

  function AddressBlock({ rawAddress }: { rawAddress: any }) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fullAddress = [
      rawAddress.street
        ? rawAddress.street_number
          ? `${rawAddress.street_number} ${rawAddress.street}`
          : rawAddress.street
        : null,
      [rawAddress.city, rawAddress.state, rawAddress.zip_code]
        .filter(Boolean)
        .join(", "),
      rawAddress.country,
    ]
      .filter(Boolean)
      .join("\n");

    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(text);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setCopiedField(null);
          timerRef.current = null;
        }, 2000);
      });
    };

    return (
      <div
        onClick={() => handleCopy(fullAddress)}
        className="relative group p-4 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
        title="Click to copy full address"
      >
        {/* Top-right icon */}
        <div className="absolute top-2 right-2">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 transition-all group-hover:scale-110 group-hover:bg-gray-200">
            {copiedField === fullAddress ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-m text-gray-500 mb-1">Full Address</p>

            {/* Street + Street Number */}
            {rawAddress.street && (
              <p className="text-l text-gray-800 font-medium">
                {rawAddress.street_number
                  ? `${rawAddress.street_number} ${rawAddress.street}`
                  : rawAddress.street}
              </p>
            )}

            {/* City, State, Zip */}
            {(rawAddress.city || rawAddress.state || rawAddress.zip_code) && (
              <p className="text-l text-gray-700 font-medium">
                {[rawAddress.city, rawAddress.state, rawAddress.zip_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {/* Country */}
            {rawAddress.country && (
              <p className="text-l text-gray-700 font-medium">
                {rawAddress.country}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="pointer-events-none p-0 m-0 bg-transparent shadow-none border-none">
            <LoadingThreeDotsJumping />
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete "
              {rawProperty.title || "this property"}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onDeleteProperty}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingThreeDotsJumping className="text-white" />
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single card with two sections */}
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-heading font-semibold text-text-headline">
                <Home className="h-5 w-5 text-primary-500" />
                Property Overview
              </CardTitle>
              <p className="text-primary-700/80 mt-1 text-sm">
                View and manage property details and location information
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={() => setIsEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit Property</span>
              </Button>
              <Button
                variant="outlineDestructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="border border-transparent"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Property Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-700">
                <Boxes className="h-5 w-5 text-primary-500" />
                Property Details
              </h3>

              <div className="space-y-4">
                {rawProperty.description && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-2">
                      <Quote className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-l text-gray-700 italic">
                        {rawProperty.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Boxes className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Property Type</p>
                      <p className="text-lg font-medium text-gray-800">
                        {rawProperty.property_type || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Ruler className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Size</p>
                      <p className="text-lg font-medium text-gray-800">
                        {rawProperty.size
                          ? `${rawProperty.size} ${
                              rawProperty.unit_system === "metric" ? "m²" : "f²"
                            }`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bed className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Bedrooms</p>
                      <p className="text-lg font-medium text-gray-800">
                        {rawProperty.bedrooms ?? "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bath className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Bathrooms</p>
                      <p className="text-lg font-medium text-gray-800">
                        {rawProperty.bathrooms ?? "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Parking</p>
                      <p className="text-lg font-medium text-gray-800">
                        {(rawProperty.parking_spaces ?? 0) > 0
                          ? `${rawProperty.parking_spaces} spot${
                              rawProperty.parking_spaces > 1 ? "s" : ""
                            }`
                          : "No parking"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-m text-gray-500">Year Built</p>
                      <p className="text-lg font-medium text-gray-800">
                        {rawProperty.year_built ?? "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-start gap-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
                  <Tag className="text-primary-500" />
                  <div>
                    <p className="text-m text-primary-500">Purchase Price</p>
                    <p className="text-lg font-medium text-primary-800">
                      {formatCurrency(
                        rawProperty.purchase_price,
                        rawProperty.currency
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-primary-500" />
                Location
              </h3>

              <div className="space-y-4">
                {rawAddress ? (
                  <>
                    <AddressBlock rawAddress={rawAddress} />

                    <div className="mt-2 rounded-xl overflow-hidden shadow-md border-0">
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500">
                      No Address Information
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Add an address to display the location
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
