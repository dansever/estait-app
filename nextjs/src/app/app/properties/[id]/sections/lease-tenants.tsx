"use client";

import { useState } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { formatCurrency } from "@/lib/formattingHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  differenceInDays,
  differenceInMonths,
  parseISO,
  format,
} from "date-fns";
import EditLeaseTenantDialog from "@/components/property/EditLeaseTenantDialog";
import { usePastLeases } from "@/components/property/usePastLeases";

export default function LeaseTenants({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const { rawLease, rawTenant, rawProperty } = data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { leases: pastLeases, loading: loadingPastLeases } = usePastLeases(
    rawProperty.id
  );

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
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={() => setIsEditOpen(true)}>
          Edit
        </Button>
        <Button variant="outlineDestructive" size="lg">
          Delete
        </Button>
      </div>
      {/* Cards grid */}
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
            {rawLease.payment_frequency === "monthly" && (
              <p>
                <strong>Payment Due Day:</strong> {rawLease.payment_due_day}
              </p>
            )}

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
                {completedDays} of {totalDays} days (
                {percentComplete.toFixed(0)}
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

      {/* Tenant Timeline Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tenant Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-gray-700">
          {loadingPastLeases ? (
            <p className="text-muted-foreground">Loading past lease data...</p>
          ) : pastLeases.length === 0 ? (
            <p className="text-muted-foreground">
              No past leases are available.
            </p>
          ) : (
            pastLeases.map((lease, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(lease.lease_start), "LLL yyyy")} –{" "}
                      {format(new Date(lease.lease_end), "LLL yyyy")}
                    </p>
                    <p>
                      <strong>Rent Paid:</strong>{" "}
                      {formatCurrency(lease.rent_amount, lease.currency)}
                    </p>
                    <p>
                      <strong>Payment Frequency:</strong>{" "}
                      {lease.payment_frequency}
                    </p>
                  </div>
                  <div>
                    {lease.tenant ? (
                      <>
                        <p>
                          <strong>Tenant:</strong> {lease.tenant.first_name}{" "}
                          {lease.tenant.last_name}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          <a
                            href={`mailto:${lease.tenant.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {lease.tenant.email}
                          </a>
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          <a
                            href={`tel:${lease.tenant.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {lease.tenant.phone}
                          </a>
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No tenant info
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Lease & Tenant Dialog */}
      <EditLeaseTenantDialog
        data={data}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={refreshData}
      />
    </div>
  );
}
