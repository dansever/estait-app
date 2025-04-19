"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  PlusCircle,
  Filter,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  FinancialTransaction,
  FinancialService,
  TransactionCreate,
} from "@/lib/services/FinancialService";
import { FinancialSummaryCard } from "@/components/property/financials/FinancialSummaryCard";
import { TransactionList } from "@/components/property/financials/TransactionList";
import { TransactionFormDialog } from "@/components/property/financials/TransactionFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FinancialsSectionProps {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

export default function FinancialsSection({
  propertyId,
  isLoading,
  onDataChanged,
}: FinancialsSectionProps) {
  // State variables
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [incomeTransactions, setIncomeTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [expenseTransactions, setExpenseTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showAddTransactionDialog, setShowAddTransactionDialog] =
    useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<FinancialTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentCurrency, setCurrentCurrency] = useState("USD");

  // Financial totals
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [cashFlow, setCashFlow] = useState(0);

  // Load transactions when component mounts or property ID changes
  useEffect(() => {
    if (propertyId && !isLoading) {
      loadTransactions();
    }
  }, [propertyId, isLoading]);

  // Calculate totals when transactions change
  useEffect(() => {
    // Calculate income total
    const incomeTotal = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    setTotalIncome(incomeTotal);

    // Calculate expense total
    const expenseTotal = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    setTotalExpenses(expenseTotal);

    // Calculate cash flow
    setCashFlow(incomeTotal - expenseTotal);

    // Set currency based on first transaction
    if (transactions.length > 0) {
      setCurrentCurrency(transactions[0].currency);
    }
  }, [transactions, incomeTransactions, expenseTransactions]);

  // Load transactions from the backend
  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);

      // Get all transactions
      const allTransactions = await FinancialService.getTransactions(
        propertyId
      );
      setTransactions(allTransactions);

      // Sort transactions by type
      setIncomeTransactions(
        allTransactions.filter((t) => t.transaction_type === "income")
      );
      setExpenseTransactions(
        allTransactions.filter((t) => t.transaction_type === "expense")
      );
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load financial transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Handle adding a new transaction
  const handleAddTransaction = async (transaction: TransactionCreate) => {
    try {
      await FinancialService.createTransaction(transaction);
      await loadTransactions();

      if (onDataChanged) {
        await onDataChanged();
      }

      toast.success("Transaction added successfully");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await FinancialService.deleteTransaction(transactionToDelete.id);
      await loadTransactions();

      if (onDataChanged) {
        await onDataChanged();
      }

      toast.success("Transaction deleted successfully");
      setShowDeleteDialog(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  // Prepare to delete a transaction
  const prepareDeleteTransaction = (transaction: FinancialTransaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteDialog(true);
  };

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-60 w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Wallet className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Financial Management</h2>
        </div>
        <Button onClick={() => setShowAddTransactionDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Transaction
        </Button>
      </div>

      {/* Financial tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Financial Summary Card */}
          <FinancialSummaryCard
            title="Financial Summary"
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            cashFlow={cashFlow}
            currency={currentCurrency}
            timeframe="monthly"
          />

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onDelete={prepareDeleteTransaction}
                />
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-500">No transactions found</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTransactionDialog(true)}
                    className="mt-2"
                  >
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ArrowUp className="h-5 w-5 mr-2 text-green-500" /> Income
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : incomeTransactions.length > 0 ? (
                <TransactionList
                  transactions={incomeTransactions}
                  onDelete={prepareDeleteTransaction}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No income transactions found</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTransactionDialog(true)}
                    className="mt-2"
                  >
                    Add Income
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setShowAddTransactionDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Income
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter Income
            </Button>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ArrowDown className="h-5 w-5 mr-2 text-red-500" /> Expense
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : expenseTransactions.length > 0 ? (
                <TransactionList
                  transactions={expenseTransactions}
                  onDelete={prepareDeleteTransaction}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No expense transactions found</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTransactionDialog(true)}
                    className="mt-2"
                  >
                    Add Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setShowAddTransactionDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Expense
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter Expenses
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <TransactionFormDialog
        isOpen={showAddTransactionDialog}
        onClose={() => setShowAddTransactionDialog(false)}
        onSubmit={handleAddTransaction}
        propertyId={propertyId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
