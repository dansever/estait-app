"use client";

import { useState, useEffect } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formattingHelpers";
import { Button } from "@/components/ui/button";
import EditLeaseDialog from "@/components/property/EditLeaseDialog";
import AddLeaseDialog from "@/components/property/AddLeaseDialog";
import { Progress } from "@/components/ui/progress";
import { FaWhatsapp, FaPhone } from "react-icons/fa";
import { Plus } from "lucide-react";
import { MdOutlineMail } from "react-icons/md";
import { differenceInDays, parseISO, format, isValid } from "date-fns";
import { usePastLeases } from "@/components/property/usePastLeases";

export default function LeaseTenants({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const { rawProperty, rawLease } = data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { leases: pastLeases, loading: loadingPastLeases } = usePastLeases(
    rawProperty.id
  );
  const start = rawLease.lease_start ? parseISO(rawLease.lease_start) : null;
  const end = rawLease.lease_end ? parseISO(rawLease.lease_end) : null;
  const today = new Date();
  const totalDays =
    start && end && isValid(start) && isValid(end)
      ? differenceInDays(end, start)
      : 0;
  const completedDays = Math.max(
    0,
    start && isValid(start) ? differenceInDays(today, start) : 0
  );

  useEffect(() => {
    if (isEditOpen || isAddOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isEditOpen, isAddOpen]);

  const percentComplete =
    totalDays > 0
      ? Math.min(100, Math.max(0, (completedDays / totalDays) * 100))
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {rawLease?.is_lease_active ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsEditOpen(true)}
            >
              Edit Lease
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsAddOpen(true)}
            >
              Add Future Lease
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-5 max-w-full"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Lease</span>
          </Button>
        )}
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
              <strong>Start:</strong>{" "}
              {start && isValid(start) ? format(start, "PPP") : "—"}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {end && isValid(end) ? format(end, "PPP") : "—"}
            </p>
            <div>
              <strong>Lease Progress:</strong>
              <Progress value={percentComplete} className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">
                {start && today < start
                  ? "Lease has not started yet"
                  : `${completedDays} of ${totalDays} days (${percentComplete.toFixed(
                      0
                    )}%)`}
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
              {rawLease.tenant_first_name
                ? `${rawLease.tenant_first_name} ${rawLease.tenant_last_name}`
                : "N/A"}
            </p>

            {rawLease.tenant_email && (
              <div className="flex items-center gap-2">
                <MdOutlineMail className="h-4 w-4 text-gray-500" />
                <a
                  href={`mailto:${rawLease.tenant_email}`}
                  className="text-blue-600 hover:underline"
                >
                  {rawLease.tenant_email}
                </a>
              </div>
            )}
            {rawLease.tenant_phone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FaPhone
                    className="h-4 w-4 text-gray-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Phone</span>

                  <a
                    href={`tel:${rawLease.tenant_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {rawLease.tenant_phone}
                  </a>
                </div>
                {typeof rawLease.tenant_phone === "string" &&
                  rawLease.tenant_phone.replace(/\D/g, "").length > 5 && (
                    <div className="flex items-center gap-2">
                      <FaWhatsapp className="h-4 w-4 text-gray-500" />
                      <a
                        href={`https://wa.me/${rawLease.tenant_phone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
              </div>
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
            <p>Loading...</p>
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
                    <p>
                      <strong>Tenant:</strong> {lease.tenant_first_name}{" "}
                      {lease.tenant_last_name}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a
                        href={`mailto:${lease.tenant_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lease.tenant_email}
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a
                        href={`tel:${lease.tenant_phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lease.tenant_phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add & Edit Lease Dialogs */}
      {/* Add Lease Dialog */}
      <AddLeaseDialog
        propertyId={rawProperty.id}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSave={refreshData}
      />

      <EditLeaseDialog
        data={data}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={refreshData}
      />
    </div>
  );
}
