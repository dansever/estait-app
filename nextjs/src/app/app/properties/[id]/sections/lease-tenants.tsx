"use client";

import { useState, useEffect } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formattingHelpers";
import { Button } from "@/components/ui/button";
import EditLeaseDialog from "@/components/property/lease/EditLeaseDialog";
import AddLeaseDialog from "@/components/property/lease/AddLeaseDialog";
import { Progress } from "@/components/ui/progress";
import {
  FaWhatsapp,
  FaPhone,
  FaRegCalendarAlt,
  FaRegMoneyBillAlt,
  FaRegClock,
  FaShieldAlt,
  FaHistory,
  FaUser,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  Plus,
  Pencil,
  CalendarClock,
  Mail,
  Banknote,
  Calendar,
  CircleUser,
  Clock,
  Key,
  Phone,
  Copy,
} from "lucide-react";
import { MdOutlineMail } from "react-icons/md";
import {
  differenceInDays,
  parseISO,
  format,
  isValid,
  isFuture,
  isPast,
  isToday,
  addDays,
} from "date-fns";

export default function LeaseTenants({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const { rawProperty, rawLease, rawPastLeases } = data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pastLeases = rawPastLeases ?? [];
  const loadingPastLeases = false;

  // Add these guards to prevent errors if rawLease is null
  const start = rawLease?.lease_start ? parseISO(rawLease.lease_start) : null;
  const end = rawLease?.lease_end ? parseISO(rawLease.lease_end) : null;

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

  // Calculate days until lease ends
  const daysRemaining = end && isValid(end) ? differenceInDays(end, today) : 0;
  const leaseStatus = () => {
    if (!start || !end || !isValid(start) || !isValid(end))
      return "No active lease";
    if (isFuture(start)) return "Upcoming";
    if (isPast(end)) return "Expired";
    if (daysRemaining <= 30) return "Ending soon";
    return "Active";
  };

  // Get status color
  const getStatusColor = () => {
    const status = leaseStatus();
    if (status === "No active lease") return "gray";
    if (status === "Upcoming") return "blue";
    if (status === "Expired") return "gray";
    if (status === "Ending soon") return "orange";
    return "green";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {rawLease?.is_lease_active ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-2 shadow-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
              <span>Edit Lease</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="gap-2 shadow-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <CalendarClock className="h-4 w-4 text-gray-500" />
              <span>Add Future Lease</span>
            </Button>
          </>
        ) : (
          <Button
            className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all duration-200"
            size="sm"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Lease</span>
          </Button>
        )}
      </div>

      {/* Two cards side by side OR fallback if no active lease */}
      {rawLease ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lease Details Card */}
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
            <div className="relative">
              <div
                className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-md ${
                  getStatusColor() === "green"
                    ? "bg-success-100 text-success"
                    : getStatusColor() === "orange"
                    ? "bg-warning-100 text-warning"
                    : getStatusColor() === "blue"
                    ? "bg-primary-100 text-primary-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {leaseStatus()}
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-heading font-semibold text-text-headline">
                <Key className="h-5 w-5 text-primary-500" />
                Lease Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lease Progress */}
              {start &&
                end &&
                isValid(start) &&
                isValid(end) &&
                rawLease.is_lease_active && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                      <span>{start && format(start, "MMM d, yyyy")}</span>
                      <span>{end && format(end, "MMM d, yyyy")}</span>
                    </div>
                    <Progress value={percentComplete} className="h-2 mb-2" />

                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-xs">
                        {completedDays} of {totalDays} days
                        <span className="ml-1 font-medium text-primary-700">
                          ({percentComplete.toFixed(0)}%)
                        </span>
                      </p>
                    </div>
                    {daysRemaining > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <p className="text-xs text-gray-600">
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                          remaining
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Main Lease Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Banknote className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Rent Amount
                    </p>
                    <p className="text-base font-medium">
                      {formatCurrency(rawLease.rent_amount, rawLease.currency)}
                      <span className="text-xs text-gray-500 ml-1">
                        / {rawLease.payment_frequency}
                      </span>
                    </p>
                  </div>
                </div>

                {rawLease.payment_frequency === "monthly" && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <CalendarClock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Payment Due
                      </p>
                      <p className="text-base font-medium">
                        Day {rawLease.payment_due_day} of each month
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FaShieldAlt className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Security Deposit
                    </p>
                    <p className="text-base font-medium">
                      {formatCurrency(
                        rawLease.security_deposit,
                        rawLease.currency
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Details Card */}
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-heading font-semibold text-text-headline">
                <CircleUser className="h-5 w-5 text-primary-500" />
                Tenant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rawLease.tenant_first_name ? (
                <>
                  <div className="flex flex-col items-center justify-center py-3">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                      <FaUser className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium">
                      {rawLease.tenant_first_name} {rawLease.tenant_last_name}
                    </h3>
                    <p className="text-sm text-gray-500">Current Tenant</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {rawLease.tenant_email && (
                      <a
                        href={`mailto:${rawLease.tenant_email}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="text-sm group-hover:text-blue-600 transition-colors">
                          {rawLease.tenant_email}
                        </span>
                      </a>
                    )}

                    {rawLease.tenant_phone && (
                      <div className="space-y-2">
                        <a
                          href={`tel:${rawLease.tenant_phone}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Phone className="h-4 w-4" />
                          </div>
                          <span className="text-sm group-hover:text-green-600 transition-colors">
                            {rawLease.tenant_phone}
                          </span>
                        </a>

                        {typeof rawLease.tenant_phone === "string" &&
                          rawLease.tenant_phone.replace(/\D/g, "").length >
                            5 && (
                            <a
                              href={`https://wa.me/${rawLease.tenant_phone.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                            >
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <FaWhatsapp className="h-4 w-4" />
                              </div>
                              <span className="text-sm group-hover:text-green-600 transition-colors">
                                Message on WhatsApp
                              </span>
                            </a>
                          )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <FaUser className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">
                    No Tenant Information
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Add a lease to record tenant details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-center text-gray-500">
          <p>No active lease currently available for this property.</p>
        </Card>
      )}

      {/* Tenant Timeline Card */}
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-heading font-semibold text-text-headline">
            <FaHistory className="h-5 w-5 text-primary-500" />
            Tenant Timeline & History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingPastLeases ? (
            <div className="py-8 flex justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-3 w-32 bg-gray-200 rounded mt-3"></div>
              </div>
            </div>
          ) : pastLeases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <FaHistory className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-medium text-gray-600">
                No Rental History Available
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                When you add past leases for this property, a complete timeline
                will appear here
              </p>
            </div>
          ) : (
            <div>
              {/* Summary of past leases */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-800">
                    Past Tenants
                  </span>
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-600 text-sm font-medium rounded-full">
                    {pastLeases.length}
                  </span>
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Total History</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {pastLeases.length > 0
                      ? `${format(
                          new Date(
                            pastLeases[pastLeases.length - 1].lease_start
                          ),
                          "MMM yyyy"
                        )} - ${format(
                          new Date(pastLeases[0].lease_end),
                          "MMM yyyy"
                        )}`
                      : "None"}
                  </span>
                </div>
              </div>

              {/* Timeline - Compact Layout */}
              <div className="relative">
                <div className="space-y-4">
                  {pastLeases.map((lease, i) => {
                    const [isExpanded, setIsExpanded] = useState(false);
                    const leaseDuration = differenceInDays(
                      new Date(lease.lease_end),
                      new Date(lease.lease_start)
                    );

                    return (
                      <div key={i} className="relative">
                        <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all">
                          {/* Compact Summary View - Always visible */}
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                <FaUser className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {lease.tenant_first_name}{" "}
                                  {lease.tenant_last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(
                                    new Date(lease.lease_start),
                                    "MMM yyyy"
                                  )}{" "}
                                  –{" "}
                                  {format(
                                    new Date(lease.lease_end),
                                    "MMM yyyy"
                                  )}
                                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                    {leaseDuration} days
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Quick Action Icons */}
                              {lease.tenant_email && (
                                <a
                                  href={`mailto:${lease.tenant_email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  title={lease.tenant_email}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Mail className="h-4 w-4" />
                                </a>
                              )}

                              {lease.tenant_phone && (
                                <a
                                  href={`tel:${lease.tenant_phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  title={lease.tenant_phone}
                                  className="text-gray-400 hover:text-green-600 transition-colors"
                                >
                                  <Phone className="h-4 w-4" />
                                </a>
                              )}

                              <div className="flex items-center gap-1">
                                <Banknote className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {formatCurrency(
                                    lease.rent_amount,
                                    lease.currency
                                  )}
                                </span>
                              </div>

                              <button className="ml-2 p-1 rounded-full hover:bg-gray-200">
                                {isExpanded ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details - Visible only when expanded */}
                          {isExpanded && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Email
                                    </p>
                                    <p className="text-sm">
                                      {lease.tenant_email || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Phone
                                    </p>
                                    <p className="text-sm">
                                      {lease.tenant_phone || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CalendarClock className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Payment Schedule
                                    </p>
                                    <p className="text-sm capitalize">
                                      {lease.payment_frequency}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <FaRegCalendarAlt className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Lease Period
                                    </p>
                                    <p className="text-sm">
                                      {format(
                                        new Date(lease.lease_start),
                                        "MMM d, yyyy"
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        new Date(lease.lease_end),
                                        "MMM d, yyyy"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Banknote className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Rent Amount
                                    </p>
                                    <p className="text-sm">
                                      {formatCurrency(
                                        lease.rent_amount,
                                        lease.currency
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Key className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Security Deposit
                                    </p>
                                    <p className="text-sm">
                                      {formatCurrency(
                                        lease.security_deposit || 0,
                                        lease.currency
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add & Edit Lease Dialogs */}
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
