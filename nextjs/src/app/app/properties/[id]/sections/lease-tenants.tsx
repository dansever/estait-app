"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { formatCurrency } from "@/lib/formattingHelpers";

export default function LeaseTenants({ data }: { data: EnrichedProperty }) {
  const { rawLease, rawTenant } = data;

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p>
        <strong>Status:</strong>{" "}
        {rawLease?.is_lease_active ? "Active" : "Inactive"}
      </p>
      <p>
        <strong>Start:</strong> {rawLease?.lease_start}
      </p>
      <p>
        <strong>End:</strong> {rawLease?.lease_end}
      </p>
      <p>
        <strong>Rent: </strong>{" "}
        {formatCurrency(rawLease?.rent_amount, rawLease?.currency)}
      </p>
      <p>
        <strong>Frequency:</strong> {rawLease?.payment_frequency}
      </p>
      <p>
        <strong>Security Deposit: </strong>
        {formatCurrency(rawLease?.security_deposit, rawLease?.currency)}
      </p>
      <p>
        <strong>Tenant:</strong>{" "}
        {rawTenant ? `${rawTenant.first_name} ${rawTenant.last_name}` : "N/A"}
      </p>
      {rawTenant && (
        <>
          <p>
            <strong>Email:</strong> {rawTenant.email}
          </p>
          <p>
            <strong>Phone:</strong> {rawTenant.phone}
          </p>
        </>
      )}
    </div>
  );
}
