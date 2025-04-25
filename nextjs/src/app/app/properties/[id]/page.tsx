"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppTabs } from "@/components/layout/AppTabs";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import {
  formatCurrency,
  formatPaymentFrequency,
} from "@/lib/formattingHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Calendar,
  Upload,
  Clock,
  Banknote,
  MapPin,
  User,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Percent,
} from "lucide-react";
import Overview from "./sections/overview";
import LeaseTenants from "./sections/lease-tenants";
import Documents from "./sections/documents";
import Financials from "./sections/financials";
import Maintenance from "./sections/maintenance";

export default function PropertyPage() {
  const { id } = useParams();
  const { user, propertiesById } = useGlobal();

  const [propertyData, setPropertyData] = useState<EnrichedProperty | null>(
    () =>
      typeof id === "string" && propertiesById[id] ? propertiesById[id] : null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user?.id || typeof id !== "string") return;
    console.log("Fetching property data for ID:", id);

    const fetchAllData = async () => {
      try {
        const supabase = await createSPASassClient();

        const rawProperty = await supabase.getProperty(user.id, id);
        const rawActiveLease = await supabase.getCurrentLeaseByProperty(id);
        const rawPastLeases = await supabase.getPastLeasesByProperty(id);
        const rawAddress = await supabase.getAddressForProperty(id);
        const rawDocuments = await supabase.getDocumentsByProperty(id);
        const rawTransactions = await supabase.getTransactionsByProperty(id);
        const rawTasks = await supabase.getTasksByProperty(id);
        const rawImages = await supabase.getImagesForDisplay(id);

        setPropertyData({
          rawProperty,
          rawActiveLease,
          rawPastLeases,
          rawAddress,
          rawDocuments,
          rawTransactions,
          rawTasks,
          rawImages,
        });
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, user?.id]);

  if (!propertyData && loading) {
    return <div className="p-6 text-gray-500">Loading property...</div>;
  }

  if (!propertyData && error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!propertyData) {
    return <div className="p-6 text-red-500">Property not found.</div>;
  }

  const refreshPropertyData = async () => {
    if (!user?.id || typeof id !== "string") return;
    const supabase = await createSPASassClient();
    const rawProperty = await supabase.getProperty(user.id, id);
    const rawActiveLease = await supabase.getCurrentLeaseByProperty(id);
    const rawPastLeases = await supabase.getPastLeasesByProperty(id);
    const rawAddress = await supabase.getAddressForProperty(id);
    const rawDocuments = await supabase.getDocumentsByProperty(id);
    const rawTransactions = await supabase.getTransactionsByProperty(id);
    const rawTasks = await supabase.getTasksByProperty(id);
    const rawImages = await supabase.getImagesForDisplay(id);

    setPropertyData({
      rawProperty,
      rawActiveLease,
      rawPastLeases,
      rawAddress,
      rawDocuments,
      rawTransactions,
      rawTasks,
      rawImages,
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!user?.id || !file) return;

    try {
      setUploadingImage(true);
      const supabase = await createSPASassClient();
      await supabase.uploadFile(
        user.id,
        file,
        true,
        propertyData.rawProperty.id
      );
      refreshPropertyData();
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const calculateOccupancyRate = () => {
    if (
      !propertyData.rawPastLeases ||
      propertyData.rawPastLeases.length === 0
    ) {
      return propertyData.rawActiveLease?.is_lease_active ? 100 : 0;
    }

    const leaseCount =
      propertyData.rawPastLeases.length + (propertyData.rawActiveLease ? 1 : 0);
    return Math.min(Math.round((leaseCount / (leaseCount + 1)) * 100), 95);
  };

  return (
    <div className="p-6 space-y-4">
      <Card className="overflow-hidden shadow-md border-0 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary-800 flex items-center gap-2">
                    <Home className="h-6 w-6 text-primary-600" />
                    {propertyData.rawProperty.title}
                  </CardTitle>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {propertyData.rawAddress
                      ? `${propertyData.rawAddress.street}, ${propertyData.rawAddress.city}, ${propertyData.rawAddress.country}`
                      : "Address not available"}
                  </p>
                </div>
                <Badge
                  className={
                    propertyData.rawActiveLease?.is_lease_active
                      ? "bg-green-100 text-green-800 border border-green-200 px-3 py-1"
                      : "bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1"
                  }
                >
                  {propertyData.rawActiveLease?.is_lease_active ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Occupied</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Vacant</span>
                    </div>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-3 flex flex-col">
                  <div className="text-primary-500 text-sm font-medium flex items-center gap-1 mb-1">
                    <Banknote className="h-4 w-4" />
                    <span>Rental Income</span>
                  </div>
                  <div className="text-xl font-bold text-primary-900">
                    {formatCurrency(
                      propertyData.rawActiveLease?.rent_amount,
                      propertyData.rawActiveLease?.currency
                    )}
                  </div>
                  <div className="text-primary-600 text-sm mt-1">
                    {formatPaymentFrequency(
                      propertyData.rawActiveLease?.payment_frequency
                    )}
                  </div>
                </div>

                <div className="bg-sky-50 rounded-lg p-3 flex flex-col">
                  {/* Header */}
                  <div className="text-sky-500 text-sm font-medium flex items-center gap-1 mb-1">
                    <User className="h-4 w-4" />
                    <span>Current Tenant</span>
                  </div>

                  {/* Tenant Name (only if lease is active) */}
                  {propertyData.rawActiveLease?.is_lease_active && (
                    <div className="text-xl font-bold text-sky-900 truncate">
                      {`${
                        propertyData.rawActiveLease.tenant_first_name ??
                        "Unnamed"
                      } ${
                        propertyData.rawActiveLease.tenant_last_name ?? ""
                      }`.trim()}
                    </div>
                  )}

                  {/* Lease Info */}
                  <div className="text-sky-600 text-sm mt-1">
                    {propertyData.rawActiveLease?.is_lease_active &&
                    propertyData.rawActiveLease.lease_start
                      ? `Since ${new Date(
                          propertyData.rawActiveLease.lease_start
                        ).toLocaleDateString()}`
                      : "No active lease"}
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 flex flex-col">
                  <div className="text-emerald-500 text-sm font-medium flex items-center gap-1 mb-1">
                    <Percent className="h-4 w-4" />
                    <span>Occupancy Rate</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-900">
                    {calculateOccupancyRate()}%
                  </div>
                  <div className="text-emerald-600 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Historical occupation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Property Images Gallery Section (1/3 width on medium+ screens) */}
          <div className="bg-gray-50 p-4 flex flex-col rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>Property Photos</span>
              {propertyData.rawImages && propertyData.rawImages.length > 0 && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploadingImage}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">Uploading...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span>Add</span>
                      </span>
                    )}
                  </Button>
                </label>
              )}
            </h3>

            <div className="flex-grow">
              {propertyData.rawImages && propertyData.rawImages.length > 0 ? (
                <ScrollArea className="h-[180px]">
                  <div className="grid grid-cols-2 gap-2">
                    {propertyData.rawImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* <Image
                          src={url}
                          alt={`Property Image ${idx + 1}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, 150px"
                        /> */}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={uploadingImage}
                  />
                  <div className="h-[180px] flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-primary-500 border-primary-200 mb-2"></div>
                        <p className="text-sm font-medium text-gray-500">
                          Uploading...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-primary-50 p-3 rounded-full mb-3">
                          <Upload className="h-6 w-6 text-primary-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Upload property photos
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to browse your files
                        </p>
                      </>
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </Card>

      <AppTabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <Overview data={propertyData} refreshData={refreshPropertyData} />
            ),
          },
          {
            id: "lease-tenants",
            label: "Lease & Tenants",
            content: (
              <LeaseTenants
                data={propertyData}
                refreshData={refreshPropertyData}
              />
            ),
          },
          {
            id: "documents",
            label: "Documents",
            content: (
              <Documents data={propertyData} onRefresh={refreshPropertyData} />
            ),
          },
          {
            id: "financials",
            label: "Financials",
            content: <Financials data={propertyData} />,
          },
          {
            id: "maintenance",
            label: "Maintenance",
            content: (
              <Maintenance
                data={propertyData}
                refreshData={refreshPropertyData}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
