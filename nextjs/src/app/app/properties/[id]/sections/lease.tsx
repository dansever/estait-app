"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Phone,
  Mail,
  UserCog,
  Clock,
  ClipboardEdit,
  UserPlus,
  CheckCircle,
  AlertCircle,
  FileSignature,
  History,
} from "lucide-react";
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

interface PropertyLeaseProps {
  propertyId: string;
  isLoading: boolean;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  move_in_date?: string;
  is_primary: boolean;
}

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  payment_due_day: number;
  status: "active" | "pending" | "expired" | "terminated";
  payment_frequency:
    | "monthly"
    | "weekly"
    | "bi-weekly"
    | "quarterly"
    | "annually";
  security_deposit: number;
  last_payment_date?: string;
  next_payment_date?: string;
}

export default function PropertyLease({
  propertyId,
  isLoading,
}: PropertyLeaseProps) {
  const [lease, setLease] = useState<Lease | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingLease, setLoadingLease] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [showEditLeaseDialog, setShowEditLeaseDialog] = useState(false);

  // Fetch lease info for this property
  useEffect(() => {
    async function fetchLeaseInfo() {
      try {
        setLoadingLease(true);

        const supabase = await createSPASassClient();
        const { data, error } = await supabase
          .from("leases")
          .select("*")
          .eq("property_id", propertyId)
          .order("start_date", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        // Mock data for development
        const mockLease: Lease = {
          id: "1",
          start_date: "2025-01-01",
          end_date: "2026-01-01",
          rent_amount: 1200,
          deposit_amount: 1200,
          payment_due_day: 1,
          status: "active",
          payment_frequency: "monthly",
          security_deposit: 1200,
          last_payment_date: "2025-04-01",
          next_payment_date: "2025-05-01",
        };

        setLease(mockLease);
      } catch (err) {
        console.error("Error fetching lease info:", err);
      } finally {
        setLoadingLease(false);
      }
    }

    if (propertyId) {
      fetchLeaseInfo();
    }
  }, [propertyId]);

  // Fetch tenants for this property
  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoadingTenants(true);

        const supabase = await createSPASassClient();
        const { data, error } = await supabase
          .from("property_tenants")
          .select(
            `
            id,
            user:user_id (
              id,
              name,
              email,
              phone,
              avatar_url
            ),
            is_primary,
            move_in_date
          `
          )
          .eq("property_id", propertyId);

        if (error) throw error;

        // Mock data for development
        const mockTenants: Tenant[] = [
          {
            id: "t1",
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "555-123-4567",
            avatar_url: null,
            move_in_date: "2025-01-01",
            is_primary: true,
          },
          {
            id: "t2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "555-987-6543",
            avatar_url: null,
            move_in_date: "2025-01-01",
            is_primary: false,
          },
        ];

        setTenants(mockTenants);
      } catch (err) {
        console.error("Error fetching tenants:", err);
      } finally {
        setLoadingTenants(false);
      }
    }

    if (propertyId) {
      fetchTenants();
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
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate days left in lease
  const getDaysLeftInLease = (endDate: string): number => {
    const today = new Date();
    const leaseEnd = new Date(endDate);
    const diffTime = leaseEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get lease status badge
  const getLeaseStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "terminated":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Handle adding a new tenant
  const handleAddTenant = () => {
    setShowAddTenantDialog(true);
  };

  // Handle editing lease
  const handleEditLease = () => {
    setShowEditLeaseDialog(true);
  };

  if (isLoading || loadingLease) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section headers */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <FileSignature className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Lease & Tenants</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditLease}>
            <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Lease
          </Button>
          <Button onClick={handleAddTenant}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Tenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lease information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2" /> Lease Details
              </span>
              {lease ? (
                getLeaseStatusBadge(lease.status)
              ) : (
                <Badge variant="outline">No Lease</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lease ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(lease.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(lease.end_date)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      {formatCurrency(lease.rent_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="font-medium flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      {formatCurrency(lease.security_deposit)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Frequency</p>
                    <p className="font-medium mt-1 capitalize">
                      {lease.payment_frequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Due</p>
                    <p className="font-medium mt-1">
                      {lease.payment_due_day === 1
                        ? "1st"
                        : lease.payment_due_day === 2
                        ? "2nd"
                        : lease.payment_due_day === 3
                        ? "3rd"
                        : `${lease.payment_due_day}th`}{" "}
                      of the month
                    </p>
                  </div>
                </div>

                {lease.status === "active" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Last Payment</p>
                        <p className="font-medium mt-1">
                          {lease.last_payment_date
                            ? formatDate(lease.last_payment_date)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Next Payment</p>
                        <p className="font-medium mt-1">
                          {lease.next_payment_date
                            ? formatDate(lease.next_payment_date)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Lease Remaining</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                (getDaysLeftInLease(lease.end_date) / 365) * 100
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">
                        {getDaysLeftInLease(lease.end_date)} days left
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <AlertCircle className="h-12 w-12 text-gray-400" />
                <p className="text-gray-500">
                  No active lease found for this property
                </p>
                <Button onClick={handleEditLease}>Create Lease</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenants information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" /> Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTenants ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : tenants.length > 0 ? (
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                            {tenant.avatar_url ? (
                              <img
                                src={tenant.avatar_url}
                                alt={tenant.name}
                                className="h-full w-full rounded-full"
                              />
                            ) : (
                              tenant.name.charAt(0)
                            )}
                          </div>

                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{tenant.name}</h3>
                              {tenant.is_primary && (
                                <Badge className="ml-2 bg-blue-600">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {tenant.move_in_date
                                ? `Moved in: ${formatDate(tenant.move_in_date)}`
                                : "Move-in date not set"}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="ml-2" size="sm">
                          <UserCog className="h-4 w-4" />
                          <span className="sr-only">Manage</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 mt-3 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{tenant.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{tenant.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <User className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    No tenants found for this property
                  </p>
                  <Button onClick={handleAddTenant}>Add Tenant</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {lease && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <History className="h-5 w-5 mr-2" /> Lease History
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-500">
                  View past leases and amendment history
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full text-left justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" /> View Lease History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Tenant Dialog */}
      <Dialog open={showAddTenantDialog} onOpenChange={setShowAddTenantDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Add a new tenant to this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="tenant-name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="tenant-name"
                  placeholder="Enter tenant's full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="tenant-email"
                  type="email"
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input id="tenant-phone" placeholder="Phone number" />
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-move-in" className="text-sm font-medium">
                  Move-in Date
                </label>
                <Input id="tenant-move-in" type="date" />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="tenant-primary"
                  type="checkbox"
                  className="rounded"
                />
                <label htmlFor="tenant-primary" className="text-sm">
                  Primary Tenant
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-notes" className="text-sm font-medium">
                  Additional Notes
                </label>
                <Textarea
                  id="tenant-notes"
                  placeholder="Additional notes about this tenant"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddTenantDialog(false)}
            >
              Cancel
            </Button>
            <Button>Add Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lease Dialog */}
      <Dialog open={showEditLeaseDialog} onOpenChange={setShowEditLeaseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{lease ? "Edit" : "Create"} Lease</DialogTitle>
            <DialogDescription>
              {lease
                ? "Update the lease details for this property."
                : "Create a new lease for this property."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="lease-start" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="lease-start"
                  type="date"
                  defaultValue={lease?.start_date}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lease-end" className="text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="lease-end"
                  type="date"
                  defaultValue={lease?.end_date}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="lease-rent" className="text-sm font-medium">
                  Monthly Rent
                </label>
                <div className="relative">
                  <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="lease-rent"
                    type="number"
                    className="pl-9"
                    defaultValue={lease?.rent_amount}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="lease-deposit" className="text-sm font-medium">
                  Security Deposit
                </label>
                <div className="relative">
                  <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="lease-deposit"
                    type="number"
                    className="pl-9"
                    defaultValue={lease?.security_deposit}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="lease-frequency"
                  className="text-sm font-medium"
                >
                  Payment Frequency
                </label>
                <select
                  id="lease-frequency"
                  className="w-full p-2 border rounded-md"
                  defaultValue={lease?.payment_frequency}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="lease-due-day" className="text-sm font-medium">
                  Payment Due Day
                </label>
                <select
                  id="lease-due-day"
                  className="w-full p-2 border rounded-md"
                  defaultValue={lease?.payment_due_day}
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lease-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="lease-status"
                className="w-full p-2 border rounded-md"
                defaultValue={lease?.status || "active"}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditLeaseDialog(false)}
            >
              Cancel
            </Button>
            <Button>{lease ? "Update" : "Create"} Lease</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
