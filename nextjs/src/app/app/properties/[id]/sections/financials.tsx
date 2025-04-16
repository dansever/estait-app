"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  DollarSign,
  Plus,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  Filter,
  ChevronDown,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyFinancialsProps {
  propertyId: string;
  isLoading: boolean;
}

interface Transaction {
  id: string;
  transaction_date: string;
  amount: number;
  category: string;
  description: string;
  type: "income" | "expense";
  status: "completed" | "pending" | "failed";
}

export default function PropertyFinancials({
  propertyId,
  isLoading,
}: PropertyFinancialsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [timeframe, setTimeframe] = useState("all"); // all, year, month
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    roi: 0,
  });

  // Fetch financial transactions for this property
  useEffect(() => {
    async function fetchFinancialData() {
      try {
        setLoadingTransactions(true);

        const supabase = await createSPASassClient();
        let query = supabase
          .from("transactions")
          .select("*")
          .eq("property_id", propertyId)
          .order("transaction_date", { ascending: false });

        // Apply timeframe filter if needed
        if (timeframe === "year") {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          query = query.gte("transaction_date", oneYearAgo.toISOString());
        } else if (timeframe === "month") {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          query = query.gte("transaction_date", oneMonthAgo.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        // Mock data for development
        const mockTransactions: Transaction[] = [
          {
            id: "1",
            transaction_date: new Date().toISOString(),
            amount: 1200,
            category: "Rent",
            description: "Monthly rent payment",
            type: "income",
            status: "completed",
          },
          {
            id: "2",
            transaction_date: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            amount: 200,
            category: "Maintenance",
            description: "Plumbing repair",
            type: "expense",
            status: "completed",
          },
          {
            id: "3",
            transaction_date: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            amount: 1200,
            category: "Rent",
            description: "Monthly rent payment",
            type: "income",
            status: "completed",
          },
          {
            id: "4",
            transaction_date: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            amount: 150,
            category: "Utilities",
            description: "Water bill",
            type: "expense",
            status: "pending",
          },
          {
            id: "5",
            transaction_date: new Date(
              Date.now() - 45 * 24 * 60 * 60 * 1000
            ).toISOString(),
            amount: 1200,
            category: "Rent",
            description: "Monthly rent payment",
            type: "income",
            status: "completed",
          },
        ];

        setTransactions(mockTransactions);

        // Calculate financial summary
        const income = mockTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = mockTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        setFinancialSummary({
          totalIncome: income,
          totalExpenses: expenses,
          netIncome: income - expenses,
          roi: income > 0 ? ((income - expenses) / income) * 100 : 0,
        });
      } catch (err) {
        console.error("Error fetching financial data:", err);
      } finally {
        setLoadingTransactions(false);
      }
    }

    if (propertyId) {
      fetchFinancialData();
    }
  }, [propertyId, timeframe]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(financialSummary.totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(financialSummary.totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Income */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Income</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(financialSummary.netIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ROI</p>
                <p className="text-2xl font-semibold">
                  {financialSummary.roi.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions section */}
      <div className="mt-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>

            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Transaction
            </Button>
          </div>
        </div>

        {loadingTransactions ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <td className="py-3 px-4 text-sm">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.description}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.category}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">
                No Transactions Found
              </h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                There are no transactions recorded for this property yet.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add First Transaction
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
