"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";

export default function Financials({ data }: { data: EnrichedProperty }) {
  const { rawTransactions } = data;

  if (!rawTransactions?.length) return <p>No financial records available.</p>;

  return (
    <table className="w-full text-sm text-left border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Date</th>
          <th className="p-2">Type</th>
          <th className="p-2">Amount</th>
          <th className="p-2">Description</th>
        </tr>
      </thead>
      <tbody>
        {rawTransactions.map((t) => (
          <tr key={t.id}>
            <td className="p-2">{t.transaction_date}</td>
            <td className="p-2">{t.transaction_type}</td>
            <td className="p-2">{t.amount}</td>
            <td className="p-2">{t.description || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
