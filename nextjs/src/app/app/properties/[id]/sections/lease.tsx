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
  FileText,
  Phone,
  Mail,
  UserCog,
  Clock,
  ClipboardEdit,
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
import { toast } from "sonner";

interface PropertyLeaseProps {
  propertyId: string;
  lease?: any;
  isLoading: boolean;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  notes?: string;
}

interface Lease {
  id: string;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  security_deposit: number | null;
  payment_due_day?: number;
  status: string | null;
  payment_frequency: string | null;
  tenant_id: string | null;
  last_payment_date?: string;
  next_payment_date?: string;
  currency?: string;
}

interface NewTenantFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  move_in_date: string;
  rent_amount: number;
  security_deposit: number;
  currency: string;
  lease_end: string;
  notes: string;
}

export default function PropertyLease({
  propertyId,
  lease: initialLease,
  isLoading,
}: PropertyLeaseProps) {
  const [lease, setLease] = useState<Lease | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingLease, setLoadingLease] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [showAddTenantDialog, setShowAddTenantDialog] = useState(false);
  const [showEditLeaseDialog, setShowEditLeaseDialog] = useState(false);
  const [submittingTenant, setSubmittingTenant] = useState(false);
  const [submittingLease, setSubmittingLease] = useState(false);
  const [existingTenants, setExistingTenants] = useState<Tenant[]>([]);
  const [loadingExistingTenants, setLoadingExistingTenants] = useState(false);
  const [useExistingTenant, setUseExistingTenant] = useState(false);
  const [selectedExistingTenantId, setSelectedExistingTenantId] = useState<
    string | null
  >(null);
  const [newTenant, setNewTenant] = useState<NewTenantFormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    move_in_date: new Date().toISOString().slice(0, 10),
    rent_amount: 0,
    security_deposit: 0,
    currency: "USD",
    lease_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .slice(0, 10),
    notes: "",
  });

  // State for edit lease form
  const [editLeaseForm, setEditLeaseForm] = useState({
    lease_start: "",
    lease_end: "",
    rent_amount: 0,
    security_deposit: 0,
    payment_frequency: "monthly",
    payment_due_day: 1,
    status: "active",
    currency: "USD",
  });

  // Get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "NIS":
      case "ILS":
        return "₪";
      default:
        return "$";
    }
  };

  // Initialize edit lease form when lease data is available or when dialog opens
  useEffect(() => {
    if (lease && showEditLeaseDialog) {
      setEditLeaseForm({
        lease_start: lease.lease_start || "",
        lease_end: lease.lease_end || "",
        rent_amount: lease.rent_amount || 0,
        security_deposit: lease.security_deposit || 0,
        payment_frequency: lease.payment_frequency || "monthly",
        payment_due_day: lease.payment_due_day || 1,
        status: lease.status || "active",
        currency: lease.currency || "USD",
      });
    }
  }, [lease, showEditLeaseDialog]);

  // Fetch all tenants for the logged-in user when dialog opens
  useEffect(() => {
    async function fetchExistingTenants() {
      if (showAddTenantDialog) {
        try {
          setLoadingExistingTenants(true);
          const supabase = await createSPASassClient();

          // Get all tenants
          const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching tenants:", error);
            return;
          }

          if (data && data.length > 0) {
            setExistingTenants(data);
          }
        } catch (err) {
          console.error("Error fetching existing tenants:", err);
        } finally {
          setLoadingExistingTenants(false);
        }
      }
    }

    fetchExistingTenants();
  }, [showAddTenantDialog]);

  // Handle input change for edit lease form
  const handleEditLeaseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    const fieldName = id.replace("lease-", "");

    // Handle numeric fields
    if (fieldName === "rent_amount" || fieldName === "security_deposit") {
      setEditLeaseForm((prev) => ({
        ...prev,
        [fieldName]: parseFloat(value) || 0,
      }));
    }
    // Handle payment_due_day (needs to be a number)
    else if (fieldName === "due-day") {
      setEditLeaseForm((prev) => ({
        ...prev,
        payment_due_day: parseInt(value) || 1,
      }));
    }
    // Handle frequency which maps to payment_frequency
    else if (fieldName === "frequency") {
      setEditLeaseForm((prev) => ({
        ...prev,
        payment_frequency: value,
      }));
    }
    // Handle all other fields
    else {
      setEditLeaseForm((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  // Handle editing lease submission
  const handleEditLeaseSubmit = async () => {
    try {
      setSubmittingLease(true);

      // Validation
      if (!editLeaseForm.lease_start || !editLeaseForm.lease_end) {
        toast.error("Lease start and end dates are required");
        return;
      }

      if (!editLeaseForm.rent_amount || editLeaseForm.rent_amount <= 0) {
        toast.error("Please enter a valid rent amount");
        return;
      }

      if (
        new Date(editLeaseForm.lease_end) <= new Date(editLeaseForm.lease_start)
      ) {
        toast.error("Lease end date must be after start date");
        return;
      }

      if (!lease?.id) {
        toast.error("No lease found to update");
        return;
      }

      const supabase = await createSPASassClient();

      // Update the lease in Supabase
      const { data: updatedLease, error } = await supabase
        .from("leases")
        .update({
          lease_start: editLeaseForm.lease_start,
          lease_end: editLeaseForm.lease_end,
          rent_amount: editLeaseForm.rent_amount,
          security_deposit: editLeaseForm.security_deposit,
          payment_frequency: editLeaseForm.payment_frequency,
          payment_due_day: editLeaseForm.payment_due_day,
          status: editLeaseForm.status,
          currency: editLeaseForm.currency,
        })
        .eq("id", lease.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating lease: ${error.message}`);
      }

      // Success - update local state with updated lease
      toast.success("Lease updated successfully");
      setLease(updatedLease);
      setShowEditLeaseDialog(false);
    } catch (error) {
      console.error("Error updating lease:", error);
      toast.error("Failed to update lease. Please try again.");
    } finally {
      setSubmittingLease(false);
    }
  };

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
          .order("lease_start", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching lease:", error);
          // No data found or other error
        } else if (data) {
          setLease(data);

          // If we have a tenant ID, fetch the tenant data
          if (data.tenant_id) {
            fetchTenantById(data.tenant_id);
          } else {
            setLoadingTenant(false);
          }
        } else {
          setLoadingTenant(false);
        }
      } catch (err) {
        console.error("Error fetching lease info:", err);
        setLoadingTenant(false);
      } finally {
        setLoadingLease(false);
      }
    }

    // If we received a lease from the parent component, use it
    if (initialLease) {
      const formattedLease = {
        id: initialLease.id,
        lease_start: initialLease.lease_start,
        lease_end: initialLease.lease_end,
        rent_amount: initialLease.rent_amount,
        security_deposit: initialLease.security_deposit,
        payment_due_day: initialLease.payment_due_day || 1,
        status: initialLease.status || "active",
        payment_frequency: initialLease.payment_frequency || "monthly",
        tenant_id: initialLease.tenant_id,
        currency: initialLease.currency || "USD",
      };
      setLease(formattedLease);

      // If we have a tenant ID from the initial lease, fetch the tenant data
      if (initialLease.tenant_id) {
        fetchTenantById(initialLease.tenant_id);
      } else {
        setLoadingTenant(false);
      }

      setLoadingLease(false);
    } else if (propertyId) {
      fetchLeaseInfo();
    }
  }, [propertyId, initialLease]);

  // Fetch tenant by ID
  const fetchTenantById = async (tenantId: string) => {
    try {
      setLoadingTenant(true);

      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (error) {
        console.error("Error fetching tenant:", error);
        return;
      }

      if (data) {
        setTenant(data);
      }
    } catch (err) {
      console.error("Error fetching tenant:", err);
    } finally {
      setLoadingTenant(false);
    }
  };

  // Handle input change for new tenant form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    const formField = id.replace("tenant-", "");
    setNewTenant((prev) => ({
      ...prev,
      [formField]: value,
    }));
  };

  // Handle selection of existing tenant
  const handleExistingTenantSelect = (tenantId: string) => {
    setSelectedExistingTenantId(tenantId);
    const selectedTenant = existingTenants.find((t) => t.id === tenantId);
    if (selectedTenant) {
      setNewTenant((prev) => ({
        ...prev,
        first_name: selectedTenant.first_name,
        last_name: selectedTenant.last_name,
        email: selectedTenant.email || "",
        phone: selectedTenant.phone || "",
      }));
    }
  };

  // Modified tenant submission to handle existing tenant selection
  const handleAddTenantSubmit = async () => {
    try {
      setSubmittingTenant(true);

      // Validation for lease details
      if (!newTenant.move_in_date || !newTenant.lease_end) {
        toast.error("Lease start and end dates are required");
        return;
      }

      if (!newTenant.rent_amount || newTenant.rent_amount <= 0) {
        toast.error("Please enter a valid rent amount");
        return;
      }

      const supabase = await createSPASassClient();
      let tenantId: string;

      if (useExistingTenant && selectedExistingTenantId) {
        // Use existing tenant
        tenantId = selectedExistingTenantId;
      } else {
        // Validation for new tenant
        if (!newTenant.first_name || !newTenant.last_name || !newTenant.email) {
          toast.error("First name, last name, and email are required");
          return;
        }

        // Create a new tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .insert({
            first_name: newTenant.first_name,
            last_name: newTenant.last_name,
            email: newTenant.email,
            phone: newTenant.phone,
            notes: newTenant.notes,
          })
          .select()
          .single();

        if (tenantError) {
          throw new Error(`Error creating tenant: ${tenantError.message}`);
        }

        if (!tenantData) {
          throw new Error("Failed to create tenant record");
        }

        tenantId = tenantData.id;
      }

      // Create the lease
      const { data: leaseData, error: leaseError } = await supabase
        .from("leases")
        .insert({
          property_id: propertyId,
          tenant_id: tenantId,
          lease_start: newTenant.move_in_date,
          lease_end: newTenant.lease_end,
          rent_amount: newTenant.rent_amount,
          security_deposit: newTenant.security_deposit,
          status: "active",
          payment_frequency: "monthly", // Default
          notes: newTenant.notes,
          currency: newTenant.currency,
        })
        .select()
        .single();

      if (leaseError) {
        throw new Error(`Error creating lease: ${leaseError.message}`);
      }

      // Success - update state with new tenant and lease
      toast.success("New lease created successfully");

      // Fetch the tenant data to update the UI
      const selectedTenant = await fetchTenantById(tenantId);
      setTenant(selectedTenant);
      setLease(leaseData);
      setShowAddTenantDialog(false);

      // Reset form
      setNewTenant({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        move_in_date: new Date().toISOString().slice(0, 10),
        rent_amount: 0,
        security_deposit: 0,
        currency: "USD",
        lease_end: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        )
          .toISOString()
          .slice(0, 10),
        notes: "",
      });
      setUseExistingTenant(false);
      setSelectedExistingTenantId(null);
    } catch (error) {
      console.error("Error creating lease:", error);
      toast.error("Failed to create lease. Please try again.");
    } finally {
      setSubmittingTenant(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency with symbol
  const formatCurrency = (
    amount: number | undefined,
    currencyCode?: string
  ) => {
    if (amount === undefined) return "N/A";

    const code = currencyCode || "USD";
    let symbol = "$"; // Default to USD

    // Determine symbol based on currency code
    switch (code) {
      case "EUR":
        symbol = "€";
        break;
      case "GBP":
        symbol = "£";
        break;
      case "NIS":
      case "ILS":
        symbol = "₪";
        break;
      default:
        symbol = "$";
    }

    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  // Handle adding a new lease
  const handleAddLease = () => {
    setShowAddTenantDialog(true);
  };

  // Handle editing lease
  const handleEditLease = () => {
    setShowEditLeaseDialog(true);
  };

  // Get formatted tenant name
  const getTenantFullName = () => {
    if (!tenant) return "No tenant";
    return `${tenant.first_name} ${tenant.last_name}`;
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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center">
          <FileSignature className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Lease & Tenants</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditLease}>
            <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Lease
          </Button>
          {!tenant && (
            <Button onClick={handleAddLease}>
              <FileSignature className="h-4 w-4 mr-2" /> New Lease
            </Button>
          )}
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
                getLeaseStatusBadge(lease.status || "unknown")
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
                      {formatDate(lease.lease_start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(lease.lease_end)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium flex items-center mt-1">
                      {formatCurrency(lease.rent_amount, lease.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Security Deposit</p>
                    <p className="font-medium flex items-center mt-1">
                      {formatCurrency(
                        lease.security_deposit || lease.rent_amount,
                        lease.currency
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Frequency</p>
                    <p className="font-medium mt-1 capitalize">
                      {lease.payment_frequency || "monthly"}
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
                        : lease.payment_due_day
                        ? `${lease.payment_due_day}th`
                        : "1st"}{" "}
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
                                (getDaysLeftInLease(lease.lease_end) / 365) *
                                  100
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">
                        {getDaysLeftInLease(lease.lease_end)} days left
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
                <Button onClick={handleAddLease}>Create New Lease</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" /> Tenant
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTenant ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : tenant ? (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3">
                          {tenant.first_name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">
                              {getTenantFullName()}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500">
                            {lease?.lease_start
                              ? `Moved in: ${formatDate(lease.lease_start)}`
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
                        <span className="text-gray-600">
                          {tenant.email || "No email"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {tenant.phone || "No phone"}
                        </span>
                      </div>
                    </div>

                    {tenant.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm mt-1">{tenant.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <User className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    No tenant assigned to this property
                  </p>
                  <Button onClick={handleAddLease}>Create New Lease</Button>
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

      {/* Add Lease Dialog */}
      <Dialog open={showAddTenantDialog} onOpenChange={setShowAddTenantDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Lease</DialogTitle>
            <DialogDescription>
              Add a new tenant and create a lease for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="use-existing-tenant" className="text-sm">
                  <input
                    type="checkbox"
                    id="use-existing-tenant"
                    checked={useExistingTenant}
                    onChange={(e) => setUseExistingTenant(e.target.checked)}
                    className="mr-2"
                  />
                  Use Existing Tenant
                </label>
              </div>

              {useExistingTenant && (
                <div className="space-y-2">
                  <label
                    htmlFor="existing-tenant"
                    className="text-sm font-medium"
                  >
                    Select Tenant
                  </label>
                  <select
                    id="existing-tenant"
                    className="w-full p-2 border rounded-md"
                    value={selectedExistingTenantId || ""}
                    onChange={(e) => handleExistingTenantSelect(e.target.value)}
                  >
                    <option value="">Select a tenant</option>
                    {existingTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!useExistingTenant && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="tenant-first_name"
                        className="text-sm font-medium"
                      >
                        First Name
                      </label>
                      <Input
                        id="tenant-first_name"
                        placeholder="First name"
                        value={newTenant.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="tenant-last_name"
                        className="text-sm font-medium"
                      >
                        Last Name
                      </label>
                      <Input
                        id="tenant-last_name"
                        placeholder="Last name"
                        value={newTenant.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tenant-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </label>
                    <Input
                      id="tenant-email"
                      type="email"
                      placeholder="Email address"
                      value={newTenant.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tenant-phone"
                      className="text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="tenant-phone"
                      placeholder="Phone number"
                      value={newTenant.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label
                    htmlFor="tenant-move_in_date"
                    className="text-sm font-medium"
                  >
                    Move-in / Lease Start Date
                  </label>
                  <Input
                    id="tenant-move_in_date"
                    type="date"
                    value={newTenant.move_in_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="tenant-lease_end"
                    className="text-sm font-medium"
                  >
                    Lease End Date
                  </label>
                  <Input
                    id="tenant-lease_end"
                    type="date"
                    value={newTenant.lease_end}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tenant-currency"
                  className="text-sm font-medium"
                >
                  Currency
                </label>
                <select
                  id="tenant-currency"
                  className="w-full p-2 border rounded-md"
                  value={newTenant.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NIS">NIS (₪)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label
                    htmlFor="tenant-rent_amount"
                    className="text-sm font-medium"
                  >
                    Monthly Rent
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(newTenant.currency)}
                    </div>
                    <Input
                      id="tenant-rent_amount"
                      type="number"
                      className="pl-9"
                      placeholder="0.00"
                      value={newTenant.rent_amount || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="tenant-security_deposit"
                    className="text-sm font-medium"
                  >
                    Security Deposit
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(newTenant.currency)}
                    </div>
                    <Input
                      id="tenant-security_deposit"
                      type="number"
                      className="pl-9"
                      placeholder="0.00"
                      value={newTenant.security_deposit || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tenant-notes" className="text-sm font-medium">
                  Additional Notes
                </label>
                <Textarea
                  id="tenant-notes"
                  placeholder="Additional notes about this tenant"
                  value={newTenant.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddTenantDialog(false)}
              disabled={submittingTenant}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTenantSubmit} disabled={submittingTenant}>
              {submittingTenant ? "Creating..." : "Create Lease"}
            </Button>
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
                  value={editLeaseForm.lease_start}
                  onChange={handleEditLeaseInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lease-end" className="text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="lease-end"
                  type="date"
                  value={editLeaseForm.lease_end}
                  onChange={handleEditLeaseInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lease-currency" className="text-sm font-medium">
                Currency
              </label>
              <select
                id="lease-currency"
                className="w-full p-2 border rounded-md"
                value={editLeaseForm.currency}
                onChange={handleEditLeaseInputChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NIS">NIS (₪)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="lease-rent_amount"
                  className="text-sm font-medium"
                >
                  Monthly Rent
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getCurrencySymbol(editLeaseForm.currency)}
                  </div>
                  <Input
                    id="lease-rent_amount"
                    type="number"
                    className="pl-9"
                    placeholder="0.00"
                    value={editLeaseForm.rent_amount || ""}
                    onChange={handleEditLeaseInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lease-security_deposit"
                  className="text-sm font-medium"
                >
                  Security Deposit
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getCurrencySymbol(editLeaseForm.currency)}
                  </div>
                  <Input
                    id="lease-security_deposit"
                    type="number"
                    className="pl-9"
                    placeholder="0.00"
                    value={editLeaseForm.security_deposit || ""}
                    onChange={handleEditLeaseInputChange}
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
                  value={editLeaseForm.payment_frequency}
                  onChange={handleEditLeaseInputChange}
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
                  value={editLeaseForm.payment_due_day}
                  onChange={handleEditLeaseInputChange}
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
                value={editLeaseForm.status}
                onChange={handleEditLeaseInputChange}
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
              disabled={submittingLease}
            >
              Cancel
            </Button>
            <Button onClick={handleEditLeaseSubmit} disabled={submittingLease}>
              {submittingLease
                ? "Updating..."
                : (lease ? "Update" : "Create") + " Lease"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
