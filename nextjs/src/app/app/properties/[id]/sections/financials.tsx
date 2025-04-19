"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePropertyDetails } from "@/hooks/use-property-details";
import {
  DollarSign,
  CalendarRange,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  AlertTriangle,
  Filter,
  Download,
  ChevronDown,
  Wallet,
  Building,
  Landmark,
  LineChart,
  PiggyBank,
  Banknote,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function FinancialsSection({
  propertyId,
  isLoading,
  onDataChanged,
}: {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}) {
  const [timeframe, setTimeframe] = useState("thisYear");
  const [activeTab, setActiveTab] = useState("overview");
  const { property, refreshProperty } = usePropertyDetails(propertyId);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sample financial data (to be replaced with actual property data)
  const financialData = {
    purchasePrice: 350000,
    currentValue: 420000,
    mortgage: {
      balance: 275000,
      interestRate: 4.25,
      payment: 1650,
      term: 30,
      startDate: "2021-06-01",
    },
    cashflow: {
      monthly: 450,
      annual: 5400,
    },
    expenses: {
      monthly: {
        mortgage: 1650,
        propertyTax: 450,
        insurance: 120,
        management: 180,
        maintenance: 200,
        utilities: 100,
        other: 50,
      },
      annual: {
        mortgage: 19800,
        propertyTax: 5400,
        insurance: 1440,
        management: 2160,
        maintenance: 2400,
        utilities: 1200,
        other: 600,
      },
    },
    income: {
      monthly: {
        rent: 2750,
        other: 0,
      },
      annual: {
        rent: 33000,
        other: 0,
      },
    },
    returns: {
      cashOnCash: 7.2,
      capRate: 5.8,
      roi: 12.5,
    },
    equity: 145000,
    recentTransactions: [
      {
        id: "1",
        date: "2024-03-15",
        description: "Rent Payment",
        amount: 2750,
        type: "income",
      },
      {
        id: "2",
        date: "2024-03-01",
        description: "Mortgage Payment",
        amount: -1650,
        type: "expense",
      },
      {
        id: "3",
        date: "2024-02-28",
        description: "Property Tax",
        amount: -450,
        type: "expense",
      },
      {
        id: "4",
        date: "2024-02-15",
        description: "Rent Payment",
        amount: 2750,
        type: "income",
      },
      {
        id: "5",
        date: "2024-02-10",
        description: "Plumbing Repair",
        amount: -350,
        type: "expense",
      },
    ],
  };

  // Calculate monthly cash flow
  const monthlyCashFlow =
    Object.values(financialData.income.monthly).reduce(
      (sum, val) => sum + val,
      0
    ) -
    Object.values(financialData.expenses.monthly).reduce(
      (sum, val) => sum + val,
      0
    );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Property Financials</h2>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Financial overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Property Value */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Property Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(financialData.currentValue)}
                </p>
                <div className="flex items-center mt-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {Math.round(
                      ((financialData.currentValue -
                        financialData.purchasePrice) /
                        financialData.purchasePrice) *
                        100
                    )}
                    % since purchase
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cashflow */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Monthly Cashflow</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(monthlyCashFlow)}
                </p>
                <div
                  className={`flex items-center mt-1 ${
                    monthlyCashFlow > 0 ? "text-green-600" : "text-red-600"
                  } text-sm`}
                >
                  {monthlyCashFlow > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                  )}
                  <span>
                    {formatCurrency(Math.abs(monthlyCashFlow) * 12)} annually
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Equity</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(financialData.equity)}
                </p>
                <div className="flex items-center mt-1 text-gray-600 text-sm">
                  <span>
                    {Math.round(
                      (financialData.equity / financialData.currentValue) * 100
                    )}
                    % of property value
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash on Cash Return */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Cash on Cash Return
                </p>
                <p className="text-2xl font-bold">
                  {financialData.returns.cashOnCash}%
                </p>
                <div className="flex items-center mt-1 text-gray-600 text-sm">
                  <span>Cap Rate: {financialData.returns.capRate}%</span>
                </div>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Financial Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Income Summary */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center text-green-700">
                    <DollarSign className="h-4 w-4 mr-1" /> Income
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Income</span>
                      <span className="font-medium">
                        {formatCurrency(financialData.income.monthly.rent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Income</span>
                      <span className="font-medium">
                        {formatCurrency(financialData.income.monthly.other)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-medium">Total Income</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(
                          Object.values(financialData.income.monthly).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses Summary */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center text-red-700">
                    <DollarSign className="h-4 w-4 mr-1" /> Expenses
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mortgage</span>
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.expenses.monthly.mortgage
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Tax</span>
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.expenses.monthly.propertyTax
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.expenses.monthly.insurance
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Others</span>
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.expenses.monthly.management +
                            financialData.expenses.monthly.maintenance +
                            financialData.expenses.monthly.utilities +
                            financialData.expenses.monthly.other
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-medium">Total Expenses</span>
                      <span className="font-bold text-red-700">
                        {formatCurrency(
                          Object.values(financialData.expenses.monthly).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center text-blue-700">
                    <BarChart3 className="h-4 w-4 mr-1" /> Performance
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Cash Flow</span>
                      <span
                        className={`font-medium ${
                          monthlyCashFlow >= 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {formatCurrency(monthlyCashFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash on Cash Return</span>
                      <span className="font-medium">
                        {financialData.returns.cashOnCash}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cap Rate</span>
                      <span className="font-medium">
                        {financialData.returns.capRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-medium">
                        {financialData.returns.roi}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-3">{formatDate(transaction.date)}</td>
                        <td className="py-3">{transaction.description}</td>
                        <td
                          className={`py-3 text-right font-medium ${
                            transaction.type === "income"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Record Transaction
            </Button>
            <Button variant="outline">
              <LineChart className="h-4 w-4 mr-2" /> Generate Report
            </Button>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="mt-6 space-y-6">
          {/* Income Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Income Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Income */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <CalendarRange className="h-4 w-4 mr-2" /> Monthly
                        Income
                      </h3>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(
                          Object.values(financialData.income.monthly).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Annual Income */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <CalendarRange className="h-4 w-4 mr-2" /> Annual Income
                      </h3>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(
                          Object.values(financialData.income.annual).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Income Sources */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Wallet className="h-4 w-4 mr-2" /> Income Sources
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Rental Income</span>
                          <span className="font-medium">
                            {Math.round(
                              (financialData.income.monthly.rent /
                                Object.values(
                                  financialData.income.monthly
                                ).reduce((sum, val) => sum + val, 0)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.round(
                                (financialData.income.monthly.rent /
                                  Object.values(
                                    financialData.income.monthly
                                  ).reduce((sum, val) => sum + val, 0)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {financialData.income.monthly.other > 0 && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Other Income</span>
                              <span className="font-medium">
                                {Math.round(
                                  (financialData.income.monthly.other /
                                    Object.values(
                                      financialData.income.monthly
                                    ).reduce((sum, val) => sum + val, 0)) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    (financialData.income.monthly.other /
                                      Object.values(
                                        financialData.income.monthly
                                      ).reduce((sum, val) => sum + val, 0)) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Income Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Income Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-2 font-medium">Source</th>
                            <th className="pb-2 font-medium text-right">
                              Monthly
                            </th>
                            <th className="pb-2 font-medium text-right">
                              Annual
                            </th>
                            <th className="pb-2 font-medium text-right">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3">Rental Income</td>
                            <td className="py-3 text-right">
                              {formatCurrency(
                                financialData.income.monthly.rent
                              )}
                            </td>
                            <td className="py-3 text-right">
                              {formatCurrency(financialData.income.annual.rent)}
                            </td>
                            <td className="py-3 text-right">
                              {Math.round(
                                (financialData.income.monthly.rent /
                                  Object.values(
                                    financialData.income.monthly
                                  ).reduce((sum, val) => sum + val, 0)) *
                                  100
                              )}
                              %
                            </td>
                          </tr>
                          {financialData.income.monthly.other > 0 && (
                            <tr className="border-b">
                              <td className="py-3">Other Income</td>
                              <td className="py-3 text-right">
                                {formatCurrency(
                                  financialData.income.monthly.other
                                )}
                              </td>
                              <td className="py-3 text-right">
                                {formatCurrency(
                                  financialData.income.annual.other
                                )}
                              </td>
                              <td className="py-3 text-right">
                                {Math.round(
                                  (financialData.income.monthly.other /
                                    Object.values(
                                      financialData.income.monthly
                                    ).reduce((sum, val) => sum + val, 0)) *
                                    100
                                )}
                                %
                              </td>
                            </tr>
                          )}
                          <tr className="font-bold">
                            <td className="py-3">Total</td>
                            <td className="py-3 text-right text-green-700">
                              {formatCurrency(
                                Object.values(
                                  financialData.income.monthly
                                ).reduce((sum, val) => sum + val, 0)
                              )}
                            </td>
                            <td className="py-3 text-right text-green-700">
                              {formatCurrency(
                                Object.values(
                                  financialData.income.annual
                                ).reduce((sum, val) => sum + val, 0)
                              )}
                            </td>
                            <td className="py-3 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          {/* Expenses Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Expenses Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Expenses */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <CalendarRange className="h-4 w-4 mr-2" /> Monthly
                        Expenses
                      </h3>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(
                          Object.values(financialData.expenses.monthly).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Annual Expenses */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <CalendarRange className="h-4 w-4 mr-2" /> Annual
                        Expenses
                      </h3>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(
                          Object.values(financialData.expenses.annual).reduce(
                            (sum, val) => sum + val,
                            0
                          )
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Expense Ratio */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" /> Expense Ratio
                      </h3>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          (Object.values(financialData.expenses.monthly).reduce(
                            (sum, val) => sum + val,
                            0
                          ) /
                            Object.values(financialData.income.monthly).reduce(
                              (sum, val) => sum + val,
                              0
                            )) *
                            100
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        of total income
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Expenses Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Expenses Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-2 font-medium">Category</th>
                            <th className="pb-2 font-medium text-right">
                              Monthly
                            </th>
                            <th className="pb-2 font-medium text-right">
                              Annual
                            </th>
                            <th className="pb-2 font-medium text-right">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(financialData.expenses.monthly).map(
                            ([key, value]) => (
                              <tr key={key} className="border-b">
                                <td className="py-3 capitalize">
                                  {key === "propertyTax" ? "Property Tax" : key}
                                </td>
                                <td className="py-3 text-right">
                                  {formatCurrency(value)}
                                </td>
                                <td className="py-3 text-right">
                                  {formatCurrency(
                                    financialData.expenses.annual[
                                      key as keyof typeof financialData.expenses.annual
                                    ]
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  {Math.round(
                                    (value /
                                      Object.values(
                                        financialData.expenses.monthly
                                      ).reduce((sum, val) => sum + val, 0)) *
                                      100
                                  )}
                                  %
                                </td>
                              </tr>
                            )
                          )}
                          <tr className="font-bold">
                            <td className="py-3">Total</td>
                            <td className="py-3 text-right text-red-700">
                              {formatCurrency(
                                Object.values(
                                  financialData.expenses.monthly
                                ).reduce((sum, val) => sum + val, 0)
                              )}
                            </td>
                            <td className="py-3 text-right text-red-700">
                              {formatCurrency(
                                Object.values(
                                  financialData.expenses.annual
                                ).reduce((sum, val) => sum + val, 0)
                              )}
                            </td>
                            <td className="py-3 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Expense
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter Expenses
            </Button>
          </div>
        </TabsContent>

        {/* Mortgage Tab */}
        <TabsContent value="mortgage" className="mt-6 space-y-6">
          {/* Mortgage Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mortgage Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mortgage Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <Landmark className="h-4 w-4 mr-2" /> Loan Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Original Balance
                        </p>
                        <p className="font-medium">
                          {formatCurrency(financialData.purchasePrice * 0.8)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="font-medium">
                          {formatCurrency(financialData.mortgage.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="font-medium">
                          {financialData.mortgage.interestRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Loan Term</p>
                        <p className="font-medium">
                          {financialData.mortgage.term} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">
                          {formatDate(financialData.mortgage.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Payment</p>
                        <p className="font-medium">
                          {formatCurrency(financialData.mortgage.payment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" /> Loan Progress
                    </h3>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Principal Paid</span>
                        <span className="font-medium">
                          {formatCurrency(
                            financialData.purchasePrice * 0.8 -
                              financialData.mortgage.balance
                          )}
                          {" ("}
                          {Math.round(
                            ((financialData.purchasePrice * 0.8 -
                              financialData.mortgage.balance) /
                              (financialData.purchasePrice * 0.8)) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.round(
                              ((financialData.purchasePrice * 0.8 -
                                financialData.mortgage.balance) /
                                (financialData.purchasePrice * 0.8)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Loan to Value (LTV)</span>
                        <span className="font-medium">
                          {Math.round(
                            (financialData.mortgage.balance /
                              financialData.currentValue) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.round(
                              (financialData.mortgage.balance /
                                financialData.currentValue) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" /> Monthly Payment
                    Breakdown
                  </h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Principal</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialData.mortgage.payment * 0.4
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Interest</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialData.mortgage.payment * 0.6
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Payment</span>
                            <span className="font-bold">
                              {formatCurrency(financialData.mortgage.payment)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm">
                      <span className="font-medium">
                        Estimated Payoff Date:
                      </span>{" "}
                      {formatDate(
                        new Date(
                          new Date(
                            financialData.mortgage.startDate
                          ).setFullYear(
                            new Date(
                              financialData.mortgage.startDate
                            ).getFullYear() + financialData.mortgage.term
                          )
                        ).toISOString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Record Payment
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Payment Schedule
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
