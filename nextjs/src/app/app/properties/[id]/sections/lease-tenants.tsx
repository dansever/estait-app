"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { formatCurrency } from "@/lib/formattingHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import { differenceInDays, differenceInMonths, parseISO } from "date-fns";

export default function LeaseTenants({ data }: { data: EnrichedProperty }) {
  const { rawLease, rawTenant } = data;

  if (!rawLease) return null;

  const start = parseISO(rawLease.lease_start);
  const end = parseISO(rawLease.lease_end);
  const today = new Date();
  const totalDays = differenceInDays(end, start);
  const completedDays = differenceInDays(today, start);
  const totalMonths = differenceInMonths(end, start);
  const completedMonths = differenceInMonths(today, start);
  const percentComplete = Math.min(
    100,
    Math.max(0, (completedDays / totalDays) * 100)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Lease Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Status:</strong>{" "}
            {rawLease.is_lease_active ? "Active" : "Inactive"}
          </p>

          <p>
            <strong>Rent:</strong>{" "}
            {formatCurrency(rawLease.rent_amount, rawLease.currency)}
          </p>
          <p>
            <strong>Frequency:</strong> {rawLease.payment_frequency}
          </p>
          <p>
            <strong>Security Deposit:</strong>{" "}
            {formatCurrency(rawLease.security_deposit, rawLease.currency)}
          </p>
          <p>
            <strong>Start:</strong> {rawLease.lease_start}
          </p>
          <p>
            <strong>End:</strong> {rawLease.lease_end}
          </p>
          <div>
            <strong>Lease Progress:</strong>
            <Progress value={percentComplete} className="mt-1" />
            <p className="text-xs text-gray-500 mt-1">
              {completedDays} of {totalDays} days ({percentComplete.toFixed(0)}
              %)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Name:</strong>{" "}
            {rawTenant
              ? `${rawTenant.first_name} ${rawTenant.last_name}`
              : "N/A"}
          </p>
          {rawTenant && (
            <>
              <div className="flex items-center gap-2">
                <MdOutlineMail className="h-4 w-4 text-gray-500" />
                <a
                  href={`mailto:${rawTenant.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {rawTenant.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="h-4 w-4 text-gray-500" />
                <a
                  href={`tel:${rawTenant.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {rawTenant.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaWhatsapp className="h-4 w-4 text-gray-500" />
                <a
                  href={`https://wa.me/${rawTenant.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  WhatsApp
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
