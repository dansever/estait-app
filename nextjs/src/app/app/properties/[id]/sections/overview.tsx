"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePropertyDetails } from "@/hooks/use-property-details";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  FileEdit,
  Trash2,
  MapPin,
  BedDouble,
  Bath,
  Building,
  Car,
  Calendar,
  Camera,
  ImagePlus,
  Landmark,
  DollarSign,
  PencilRuler,
  Library,
  FileEdit as FileIcon,
  Info,
} from "lucide-react";
import { TbRulerMeasure } from "react-icons/tb";
import { createSPASassClient } from "@/lib/supabase/client";
import { deleteProperty } from "@/lib/supabase/queries/properties";
import EditPropertyDialog from "@/components/property/EditPropertyDialog";

export default function OverviewSection({
  propertyId,
  isLoading: parentIsLoading,
  onDataChanged,
}: {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}) {
  // Use the hook to get property data
  const {
    property,
    isLoading: hookIsLoading,
    error,
    refreshProperty,
    getFormattedAddress,
    getPropertyStatus,
  } = usePropertyDetails(propertyId);
  const router = useRouter();

  // Combined loading state
  const isLoading = parentIsLoading || hookIsLoading;

  // UI state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stock photos for property visualizations
  const stockPhotos = [
    "/stock_photos/apartment_1.jpg",
    "/stock_photos/apartment_2.jpg",
    "/stock_photos/apartment_3.jpg",
    "/stock_photos/apartment_4.jpg",
  ];

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === stockPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === 0 ? stockPhotos.length - 1 : prev - 1
    );
  };

  // Handle property removal
  const removeProperty = async () => {
    try {
      setIsDeleting(true);
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.rpc(
        "delete_property_and_related_data",
        { property_id_input: propertyId }
      );

      if (error || data !== true) {
        console.error("Error deleting property:", error);
        toast.error("Failed to delete property. Please try again.");
        return;
      }

      toast.success("Property and related data successfully deleted");
      router.push("/app/properties");
    } catch (error) {
      console.error("Unexpected error deleting property:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-3">
        <Info className="h-12 w-12 text-gray-400" />
        <p className="text-xl font-medium">Property not found</p>
        <p className="text-gray-500">
          The property you&rsquo;re looking for doesn&rsquo;t exist or you
          don&rsquo;t have permission to view it.
        </p>
      </div>
    );
  }

  // Extract key property values for presentation
  const propertyType = property.property_type || "apartment";
  const bedrooms = property.bedrooms || 2;
  const bathrooms = property.bathrooms || 1;
  const size = property.size || 0;
  const yearBuilt = property.year_built || 2010;
  const parkingSpaces = property.parking_spaces || 1;
  const status = getPropertyStatus();

  // Extract units of measure
  const propertyCurrency = property.currency || "USD";
  const rentCurrency = property.current_lease?.currency || "USD";
  const unitOfMeasure = property.unit_system || "imperial";

  // Financial information
  const purchasePrice = property.purchase_price || 180000;
  const purchaseDate = property.purchase_date || null;
  const currentValue = property.current_value || purchasePrice * 1.15;
  const monthlyIncome = property.current_lease?.rent_amount || 0;
  const monthlyExpenses = 350; // Estimate or mock for now
  const cashFlow = monthlyIncome - monthlyExpenses;

  const formatCurrency = (value: number, currency = "USD") => {
    const currencySymbol = getCurrencySymbol(currency);
    return `${currencySymbol}${value.toLocaleString()}`;
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "NIS":
        return "₪";
      case "CAD":
        return "C$";
      case "AUD":
        return "A$";
      default:
        return "$";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Section headers */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Home className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Property Overview</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <FileEdit className="h-4 w-4 mr-2" /> Edit Property
          </Button>
          <Button
            variant="outlineDestructive"
            onClick={() => setShowRemoveDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Remove Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo gallery */}
        <div className="lg:col-span-2">
          <Card>
            <div className="relative w-full h-[300px] overflow-hidden">
              {stockPhotos && stockPhotos.length > 0 ? (
                <>
                  <Image
                    src={stockPhotos[activePhotoIndex]}
                    alt={`Property photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={handlePrevPhoto}
                    >
                      <span className="text-xl font-bold">‹</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={handleNextPhoto}
                    >
                      <span className="text-xl font-bold">›</span>
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={() => setShowPhotoDialog(true)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      View All Photos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-sm">
                    {activePhotoIndex + 1} / {stockPhotos.length}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">No photos available</p>
                  <Button variant="outline" className="mt-2">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              )}
            </div>

            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <BedDouble className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">{bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">{bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <TbRulerMeasure className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {size.toLocaleString()}{" "}
                    {unitOfMeasure === "imperial" ? "ft²" : "m²"}
                  </span>
                </div>
                {parkingSpaces && (
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">{parkingSpaces} Parking</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium capitalize">{propertyType}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">Built {yearBuilt}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-lg">
                  {property.title || "Property Title"}
                </h3>
                <p className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {getFormattedAddress(property.address)}
                </p>

                {property.description && (
                  <div className="mt-4 text-gray-700">
                    <p>{property.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property details summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Property Details</span>
                <Badge
                  variant={status === "vacant" ? "outline" : "default"}
                  className={
                    status === "vacant"
                      ? "border-yellow-500 text-yellow-600"
                      : status === "occupied"
                      ? "bg-green-600"
                      : status === "maintenance"
                      ? "bg-orange-600"
                      : "bg-blue-600"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Information</p>
                <div className="grid grid-cols-2 gap-y-2 mt-1">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Price</p>
                    <p className="font-medium">
                      {formatCurrency(purchasePrice, propertyCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(purchaseDate)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="font-medium text-lg">
                  {formatCurrency(currentValue, propertyCurrency)}
                </p>
                {purchasePrice && currentValue && (
                  <div className="flex items-center text-sm mt-1">
                    <Badge
                      className={
                        currentValue > purchasePrice
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
                    >
                      {currentValue > purchasePrice ? "+" : ""}
                      {(
                        ((currentValue - purchasePrice) / purchasePrice) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                    <span className="ml-2 text-gray-500">since purchase</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  <PencilRuler className="h-4 w-4 mr-2" />
                  Request New Appraisal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Landmark className="h-5 w-5 mr-2" /> Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <p className="font-medium">
                      {formatCurrency(monthlyIncome, rentCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                    <p className="font-medium">
                      {formatCurrency(monthlyExpenses, rentCurrency)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cash Flow</p>
                  <p
                    className={`font-medium ${
                      cashFlow >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(cashFlow, rentCurrency)} / month
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Full Financials
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Library className="h-5 w-5 mr-2" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-gray-500">Important property documents</p>
              <Button
                variant="outline"
                className="mt-3 w-full text-left justify-start"
              >
                <FileIcon className="h-4 w-4 mr-2" /> View All Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        property={property}
        onPropertyUpdated={(updatedProperty) => {
          // Update the property in the parent component
          refreshProperty();
          toast.success("Property updated successfully");
        }}
      />

      {/* Photo Gallery Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {stockPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200"
                onClick={() => {
                  setActivePhotoIndex(index);
                  setShowPhotoDialog(false);
                }}
              >
                <Image
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
            <div className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
              <div className="flex flex-col items-center text-gray-500">
                <ImagePlus className="h-8 w-8 mb-2" />
                <p>Add New Photo</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Property Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeProperty();
                setShowRemoveDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
