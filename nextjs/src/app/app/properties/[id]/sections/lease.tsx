"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import AddLeaseDialog from "@/components/property/lease/AddLeaseDialog";
import EditLeaseDialog from "@/components/property/lease/EditLeaseDialog";
import { formatCurrency } from "@/components/property/lease/lease-utils";
import { usePropertyDetails } from "@/hooks/use-property-details";
import {
  getOrdinalSuffix,
  calculateNextPaymentDate,
  formatDate,
  getRemainingTime,
} from "@/lib/utils/formatters";
import {
  Users,
  CalendarClock,
  DollarSign,
  Clock,
  Calendar,
  CreditCard,
  Plus,
  ClipboardEdit,
  HelpCircle,
  Building2,
} from "lucide-react";

export default function LeaseSection({
  propertyId,
  isLoading,
  onDataChanged,
}: {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}) {
  const [showAddLeaseDialog, setShowAddLeaseDialog] = useState(false);
  const [showEditLeaseDialog, setShowEditLeaseDialog] = useState(false);
  const { property, refreshProperty } = usePropertyDetails(propertyId);

  // Get the current lease from the property
  const lease = property?.current_lease || null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // No lease state
  const noLease = !lease;

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Lease & Tenant Information</h2>
        <div className="flex gap-2">
          {noLease ? (
            <Button onClick={() => setShowAddLeaseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Lease
            </Button>
          ) : (
            <Button onClick={() => setShowEditLeaseDialog(true)}>
              <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Lease
            </Button>
          )}
        </div>
      </div>

      {/* Current Lease Information */}
      {noLease ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Active Lease</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              This property doesn't have an active lease agreement. Add a lease
              to start tracking tenant information and rent payments.
            </p>
            <Button onClick={() => setShowAddLeaseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Lease
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lease Details Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CalendarClock className="h-5 w-5 mr-2" /> Lease Details
                  </span>
                  <Badge
                    variant={
                      lease.status === "active"
                        ? "default"
                        : lease.status === "pending"
                        ? "outline"
                        : "secondary"
                    }
                    className={
                      lease.status === "active"
                        ? "bg-green-600"
                        : lease.status === "pending"
                        ? "border-yellow-500 text-yellow-600"
                        : lease.status === "terminated"
                        ? "bg-red-600"
                        : "bg-gray-600"
                    }
                  >
                    {lease.status?.charAt(0).toUpperCase() +
                      lease.status?.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {formatDate(lease.lease_start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(lease.lease_end)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Term Length</p>
                    <p className="font-medium">
                      {lease.lease_start && lease.lease_end
                        ? Math.round(
                            (new Date(lease.lease_end).getTime() -
                              new Date(lease.lease_start).getTime()) /
                              (1000 * 60 * 60 * 24 * 30.44)
                          ) + " months"
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="font-medium">
                      {getRemainingTime(lease.lease_end)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 pt-2">
                  <div>
                    <p className="text-sm text-gray-500">Rent Amount</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(lease.rent_amount || 0, lease.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frequency</p>
                    <p className="font-medium capitalize">
                      {lease.payment_frequency || "Monthly"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Day</p>
                    <p className="font-medium">
                      {lease.payment_due_day
                        ? `${lease.payment_due_day}${getOrdinalSuffix(
                            lease.payment_due_day
                          )}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="font-medium">
                      {lease.security_deposit
                        ? formatCurrency(lease.security_deposit, lease.currency)
                        : "None"}
                    </p>
                  </div>
                </div>

                {lease.notes && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm mt-1">{lease.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tenant Information Card */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" /> Tenant
                </CardTitle>
              </CardHeader>

              {lease.tenant ? (
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-lg">
                      {lease.tenant.first_name} {lease.tenant.last_name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {lease.tenant.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-all">
                          {lease.tenant.email}
                        </p>
                      </div>
                    )}
                    {lease.tenant.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{lease.tenant.phone}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      View Tenant Profile
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="text-center py-4">
                    <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No tenant information available
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Payment Schedule & History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" /> Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {noLease ? (
            <div className="text-center py-6">
              <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                No payment information available. Add a lease first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Schedule */}
              <div className="space-y-2">
                <h3 className="font-medium">Payment Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className="text-sm text-gray-600">
                            {lease.payment_due_day
                              ? `${lease.payment_due_day}${getOrdinalSuffix(
                                  lease.payment_due_day
                                )} of each month`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <DollarSign className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="font-medium">Amount</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(
                              lease.rent_amount || 0,
                              lease.currency
                            )}
                            /{lease.payment_frequency}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="font-medium">Next Payment</p>
                          <p className="text-sm text-gray-600">
                            {calculateNextPaymentDate(lease)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Actions for payments */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Record Payment</Button>
                <Button variant="outline">Payment History</Button>
                <Button variant="outline">Generate Receipt</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lease History */}
      <LeaseHistory
        propertyId={propertyId}
        leases={property?.lease_history || []}
        isLoading={isLoading}
      />

      {/* Add Lease Dialog */}
      <AddLeaseDialog
        propertyId={propertyId}
        open={showAddLeaseDialog}
        setOpen={setShowAddLeaseDialog}
        onLeaseAdded={async () => {
          if (onDataChanged) {
            await onDataChanged();
          }
          refreshProperty();
        }}
      />

      {/* Edit Lease Dialog */}
      {lease && (
        <EditLeaseDialog
          open={showEditLeaseDialog}
          setOpen={setShowEditLeaseDialog}
          lease={lease}
          onLeaseUpdated={async () => {
            if (onDataChanged) {
              await onDataChanged();
            }
            refreshProperty();
          }}
        />
      )}
    </div>
  );
}
