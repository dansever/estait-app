"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  MapPin,
  Home,
  BedDouble,
  Bath,
  Calendar,
  Landmark,
  Building,
  DollarSign,
  FileEdit,
  ImagePlus,
  Camera,
  Info,
  PencilRuler,
  Library,
  Car,
} from "lucide-react";
import { TbRulerMeasure } from "react-icons/tb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Import the usePropertyDetails hook
import { usePropertyDetails } from "@/hooks/use-property-details";

interface PropertyOverviewProps {
  propertyId: string;
  isLoading: boolean;
}

export default function PropertyOverview({
  propertyId,
  isLoading: parentIsLoading,
}: PropertyOverviewProps) {
  // Use the hook to get real property data instead of mock data
  const {
    property,
    isLoading: hookIsLoading,
    error,
    refreshProperty,
    getFormattedAddress,
    getPropertyStatus,
  } = usePropertyDetails(propertyId);

  // Combined loading state
  const isLoading = parentIsLoading || hookIsLoading;

  // UI state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Stock photos for property visualizations
  const stockPhotos = [
    "/stock_photos/apartment_1.jpg",
    "/stock_photos/apartment_2.jpg",
    "/stock_photos/apartment_3.jpg",
    "/stock_photos/apartment_4.jpg",
  ];

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle viewing next photo
  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === (stockPhotos.length || 0) - 1 ? 0 : prev + 1
    );
  };

  // Handle viewing previous photo
  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === 0 ? (stockPhotos.length || 0) - 1 : prev - 1
    );
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

  // Extract untis of measure
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

  return (
    <div className="space-y-6">
      {/* Section headers */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Home className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Property Overview</h2>
        </div>
        <Button variant="outline" onClick={() => setShowEditDialog(true)}>
          <FileEdit className="h-4 w-4 mr-2" /> Edit Property
        </Button>
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
                <FileEdit className="h-4 w-4 mr-2" /> View All Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Property Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Property Details</DialogTitle>
            <DialogDescription>
              Update information for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="property-name" className="text-sm font-medium">
                Property Name
              </label>
              <Input id="property-name" defaultValue={property.title || ""} />
            </div>

            <div className="space-y-2">
              <label htmlFor="property-address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="property-address"
                defaultValue={property.address?.street || ""}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="property-city" className="text-sm font-medium">
                  City
                </label>
                <Input
                  id="property-city"
                  defaultValue={property.address?.city || ""}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-state" className="text-sm font-medium">
                  State
                </label>
                <Input
                  id="property-state"
                  defaultValue={property.address?.state || ""}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-zip" className="text-sm font-medium">
                  ZIP
                </label>
                <Input
                  id="property-zip"
                  defaultValue={property.address?.zip_code || ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="property-type" className="text-sm font-medium">
                  Property Type
                </label>
                <select
                  id="property-type"
                  className="w-full p-2 border rounded-md"
                  defaultValue={propertyType}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="property-status"
                  className="text-sm font-medium"
                >
                  Status
                </label>
                <select
                  id="property-status"
                  className="w-full p-2 border rounded-md"
                  defaultValue={status}
                >
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="listed">Listed For Rent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="property-bedrooms"
                  className="text-sm font-medium"
                >
                  Bedrooms
                </label>
                <Input
                  id="property-bedrooms"
                  type="number"
                  defaultValue={bedrooms}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="property-bathrooms"
                  className="text-sm font-medium"
                >
                  Bathrooms
                </label>
                <Input
                  id="property-bathrooms"
                  type="number"
                  step="0.5"
                  defaultValue={bathrooms}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-sqft" className="text-sm font-medium">
                  Size
                </label>
                <Input id="property-sqft" type="number" defaultValue={size} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="property-year" className="text-sm font-medium">
                  Year Built
                </label>
                <Input
                  id="property-year"
                  type="number"
                  defaultValue={yearBuilt}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="property-parking"
                  className="text-sm font-medium"
                >
                  Parking Spaces
                </label>
                <Input
                  id="property-parking"
                  type="number"
                  defaultValue={parkingSpaces || 0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="property-description"
                className="text-sm font-medium"
              >
                Property Description
              </label>
              <Textarea
                id="property-description"
                defaultValue={property.description || ""}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                refreshProperty();
                setShowEditDialog(false);
              }}
            >
              Update Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
