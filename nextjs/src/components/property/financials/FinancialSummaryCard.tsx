import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/components/property/lease/lease-utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface FinancialSummaryCardProps {
  title: string;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  currency?: string;
  timeframe?: string;
}

export function FinancialSummaryCard({
  title,
  totalIncome,
  totalExpenses,
  cashFlow,
  currency = "USD",
  timeframe = "monthly",
}: FinancialSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income Summary */}
          <div>
            <h3 className="font-medium mb-3 flex items-center text-green-700">
              <ArrowUp className="h-4 w-4 mr-1" /> Income
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(totalIncome, currency)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                /{timeframe}
              </span>
            </p>
          </div>

          {/* Expenses Summary */}
          <div>
            <h3 className="font-medium mb-3 flex items-center text-red-700">
              <ArrowDown className="h-4 w-4 mr-1" /> Expenses
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(totalExpenses, currency)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                /{timeframe}
              </span>
            </p>
          </div>

          {/* Cash Flow */}
          <div>
            <h3 className="font-medium mb-3">Cash Flow</h3>
            <p
              className={`text-2xl font-bold ${
                cashFlow >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatCurrency(cashFlow, currency)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                /{timeframe}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
