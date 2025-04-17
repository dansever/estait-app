import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

// Interface definitions
export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  notes?: string;
}

export interface Lease {
  id: string;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  security_deposit: number;
  payment_due_day?: number;
  status: string | null;
  payment_frequency: Database["public"]["Enums"]["payment_frequency"] | null;
  tenant_id: string | null;
  currency?: string;
}

export interface NewTenantFormState {
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

export interface EditLeaseFormState {
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  security_deposit: number;
  payment_frequency: Database["public"]["Enums"]["payment_frequency"];
  payment_due_day: number;
  status: string;
  currency: string;
}

// Fetch tenant by ID
export const fetchTenantById = async (
  tenantId: string
): Promise<Tenant | null> => {
  try {
    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (error) {
      console.error("Error fetching tenant:", error);
      return null;
    }

    if (data) {
      return data as Tenant;
    }

    return null;
  } catch (err) {
    console.error("Error fetching tenant:", err);
    return null;
  }
};

// Format date for display
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

// Get currency symbol based on currency code
export const getCurrencySymbol = (currencyCode: string): string => {
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

// Format currency with symbol
export const formatCurrency = (
  amount: number | undefined,
  currencyCode?: string
): string => {
  if (amount === undefined) return "N/A";

  const symbol = getCurrencySymbol(currencyCode || "USD");

  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}`;
};

// Calculate days left in lease
export const getDaysLeftInLease = (endDate: string): number => {
  const today = new Date();
  const leaseEnd = new Date(endDate);
  const diffTime = leaseEnd.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get formatted tenant name
export const getTenantFullName = (tenant: Tenant | null): string => {
  if (!tenant) return "No tenant";
  return `${tenant.first_name} ${tenant.last_name}`;
};

// Get lease status badge
export const getLeaseStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" /> Active
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
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

// Get lease status properties
export const getLeaseStatusProperties = (status: string) => {
  switch (status) {
    case "active":
      return {
        variant: "default",
        className: "bg-green-600",
        icon: "CheckCircle",
        text: "Active",
      };
    case "pending":
      return {
        variant: "outline",
        className: "border-yellow-500 text-yellow-600",
        icon: "Clock",
        text: "Pending",
      };
    // other cases...
  }
};

// Create a default tenant form state
export const createDefaultNewTenantState = (): NewTenantFormState => {
  return {
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
  };
};

// Initialize edit lease form from existing lease
export const initializeEditLeaseForm = (lease: Lease): EditLeaseFormState => {
  // Format dates properly for HTML input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return {
    lease_start: formatDateForInput(lease.lease_start),
    lease_end: formatDateForInput(lease.lease_end),
    rent_amount: lease.rent_amount || 0,
    security_deposit: lease.security_deposit || 0,
    payment_frequency: lease.payment_frequency || "monthly",
    payment_due_day: lease.payment_due_day || 1,
    status: lease.status || "active",
    currency: lease.currency || "USD",
  };
};
