"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppTabs } from "@/components/layout/AppTabs";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import {
  formatCurrency,
  formatPaymentFrequency,
} from "@/lib/formattingHelpers";
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

        setPropertyData({
          rawProperty,
          rawActiveLease,
          rawPastLeases,
          rawAddress,
          rawDocuments,
          rawTransactions,
          rawTasks,
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

    setPropertyData({
      rawProperty,
      rawActiveLease,
      rawPastLeases,
      rawAddress,
      rawDocuments,
      rawTransactions,
      rawTasks,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{propertyData.rawProperty.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Status:</strong>{" "}
            {propertyData.rawActiveLease?.is_lease_active
              ? "Occupied"
              : "Vacant"}
          </p>
          <p>
            <strong>Rent: </strong>
            {formatCurrency(
              propertyData.rawActiveLease?.rent_amount,
              propertyData.rawActiveLease?.currency
            )}
            {formatPaymentFrequency(
              propertyData.rawActiveLease?.payment_frequency
            )}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {propertyData.rawAddress
              ? `${propertyData.rawAddress.street}, ${propertyData.rawAddress.city}, ${propertyData.rawAddress.country}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <AppTabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <Overview
                data={propertyData}
                refreshData={refreshPropertyData} // pass refresh
              />
            ),
          },
          {
            id: "lease-tenants",
            label: "Lease & Tenants",
            content: (
              <LeaseTenants
                data={propertyData}
                refreshData={refreshPropertyData} // pass refresh
              />
            ),
          },
          {
            id: "documents",
            label: "Documents",
            content: (
              <Documents
                data={propertyData}
                onRefresh={refreshPropertyData} // pass refresh
              />
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
                refreshData={refreshPropertyData} // pass refresh
              />
            ),
          },
        ]}
      />
    </div>
  );
}
