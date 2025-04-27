"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formattingHelpers";
import {
  CircleDollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
} from "lucide-react";
import { format } from "date-fns";

export default function Financials({ data }: { data: EnrichedProperty }) {
  const { rawTransactions } = data;

  if (!rawTransactions?.length) {
    return (
      <Card className="overflow-hidden shadow-md border-0 bg-white">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-heading font-semibold text-text-headline">
                <CircleDollarSign className="h-5 w-5 text-primary-500" />
                Financial Records
              </CardTitle>
              <p className="text-primary-700/80 mt-1 text-sm">
                Property income and expense transaction history
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Info className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-500">
              No Financial Records Available
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Financial transactions for this property will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-md border-0 bg-white">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-heading font-semibold text-text-headline">
              <CircleDollarSign className="h-5 w-5 text-primary-500" />
              Financial Records
            </CardTitle>
            <p className="text-primary-700/80 mt-1 text-sm">
              Property income and expense transaction history
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {rawTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {format(new Date(t.transaction_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`${
                        t.transaction_type === "income"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {t.transaction_type === "income" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownLeft className="h-3 w-3" />
                        )}
                        {t.transaction_type
                          ? t.transaction_type.charAt(0).toUpperCase() +
                            t.transaction_type.slice(1)
                          : "Unknown"}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <span
                      className={`${
                        t.transaction_type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(t.amount, data.rawProperty.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
