"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
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

interface PropertyOverviewProps {
  propertyId: string;
  isLoading: boolean;
}

interface PropertyDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  purchase_price?: number;
  purchase_date?: string;
  current_value?: number;
  status: "occupied" | "vacant" | "maintenance" | "listed";
  description?: string;
  parking_spaces?: number;
  photos: string[];
}

export default function PropertyOverview({
  propertyId,
  isLoading,
}: PropertyOverviewProps) {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Fetch property details
  useEffect(() => {
    async function fetchPropertyDetails() {
      try {
        setLoading(true);

        const supabase = await createSPASassClient();
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (error) throw error;

        // Mock data for development
        const mockProperty: PropertyDetails = {
          id: propertyId,
          name: "Sunset Terrace Apartment",
          address: "123 Main Street, Apt 4B",
          city: "Springfield",
          state: "IL",
          zip: "62704",
          type: "apartment",
          bedrooms: 2,
          bathrooms: 1.5,
          square_feet: 950,
          year_built: 2010,
          purchase_price: 180000,
          purchase_date: "2020-03-15",
          current_value: 210000,
          status: "occupied",
          description:
            "Modern apartment in a quiet neighborhood with great amenities. Close to downtown and public transportation.",
          parking_spaces: 1,
          photos: [
            "/stock_photos/apartment_1.jpg",
            "/stock_photos/apartment_2.jpg",
            "/stock_photos/apartment_3.jpg",
            "/stock_photos/apartment_4.jpg",
          ],
        };

        setProperty(mockProperty);
      } catch (err) {
        console.error("Error fetching property details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get property status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "occupied":
        return <Badge className="bg-green-600">Occupied</Badge>;
      case "vacant":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Vacant
          </Badge>
        );
      case "maintenance":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            Maintenance
          </Badge>
        );
      case "listed":
        return <Badge className="bg-blue-600">Listed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Handle viewing next photo
  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === (property?.photos.length || 0) - 1 ? 0 : prev + 1
    );
  };

  // Handle viewing previous photo
  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === 0 ? (property?.photos.length || 0) - 1 : prev - 1
    );
  };

  if (isLoading || loading) {
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
          The property you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
      </div>
    );
  }

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
              {property.photos && property.photos.length > 0 ? (
                <>
                  <Image
                    src={property.photos[activePhotoIndex]}
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
                    {activePhotoIndex + 1} / {property.photos.length}
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
                  <span className="font-medium">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {property.bathrooms} Baths
                  </span>
                </div>
                <div className="flex items-center">
                  <TbRulerMeasure className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {property.square_feet.toLocaleString()} sq ft
                  </span>
                </div>
                {property.parking_spaces && (
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">
                      {property.parking_spaces} Parking
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium capitalize">
                    {property.type}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    Built {property.year_built}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-lg">{property.name}</h3>
                <p className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.address}, {property.city}, {property.state}{" "}
                  {property.zip}
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
                {getStatusBadge(property.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Information</p>
                <div className="grid grid-cols-2 gap-y-2 mt-1">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Price</p>
                    <p className="font-medium">
                      {formatCurrency(property.purchase_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">
                      {formatDate(property.purchase_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="font-medium text-lg">
                  {formatCurrency(property.current_value)}
                </p>
                {property.purchase_price && property.current_value && (
                  <div className="flex items-center text-sm mt-1">
                    <Badge
                      className={
                        property.current_value > property.purchase_price
                          ? "bg-green-600"
                          : "bg-red-600"
                      }
                    >
                      {property.current_value > property.purchase_price
                        ? "+"
                        : ""}
                      {(
                        ((property.current_value - property.purchase_price) /
                          property.purchase_price) *
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
                    <p className="font-medium">{formatCurrency(1200)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Expenses</p>
                    <p className="font-medium">{formatCurrency(350)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cash Flow</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(850)} / month
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
              <Input id="property-name" defaultValue={property.name} />
            </div>

            <div className="space-y-2">
              <label htmlFor="property-address" className="text-sm font-medium">
                Address
              </label>
              <Input id="property-address" defaultValue={property.address} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="property-city" className="text-sm font-medium">
                  City
                </label>
                <Input id="property-city" defaultValue={property.city} />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-state" className="text-sm font-medium">
                  State
                </label>
                <Input id="property-state" defaultValue={property.state} />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-zip" className="text-sm font-medium">
                  ZIP
                </label>
                <Input id="property-zip" defaultValue={property.zip} />
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
                  defaultValue={property.type}
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
                  defaultValue={property.status}
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
                  defaultValue={property.bedrooms}
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
                  defaultValue={property.bathrooms}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="property-sqft" className="text-sm font-medium">
                  Square Feet
                </label>
                <Input
                  id="property-sqft"
                  type="number"
                  defaultValue={property.square_feet}
                />
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
                  defaultValue={property.year_built}
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
                  defaultValue={property.parking_spaces || 0}
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
            <Button>Update Property</Button>
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
            {property.photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200"
                onClick={() => {
                  setActivePhotoIndex(index);
                  setShowPhotoDialog(false);
                }}
              >
                <img
                  src={photo}
                  alt={`Property photo ${index + 1}`}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
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
