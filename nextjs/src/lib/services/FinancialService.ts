import { createSPASassClient } from "@/lib/supabase/client";

export interface FinancialTransaction {
  id: string;
  property_id: string;
  date: string;
  amount: number;
  currency: string;
  transaction_type: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  property_id: string;
  date: string;
  amount: number;
  currency: string;
  transaction_type: string;
  category: string;
  description?: string | null;
}

/**
 * Service class for managing property financial operations
 */
export class FinancialService {
  /**
   * Get all financial transactions for a property
   */
  static async getTransactions(
    propertyId: string
  ): Promise<FinancialTransaction[]> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      throw error;
    }
  }

  /**
   * Get income transactions for a property
   */
  static async getIncomeTransactions(
    propertyId: string
  ): Promise<FinancialTransaction[]> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .eq("transaction_type", "income")
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching income transactions:", error);
      throw error;
    }
  }

  /**
   * Get expense transactions for a property
   */
  static async getExpenseTransactions(
    propertyId: string
  ): Promise<FinancialTransaction[]> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .eq("transaction_type", "expense")
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expense transactions:", error);
      throw error;
    }
  }

  /**
   * Create a new financial transaction
   */
  static async createTransaction(
    transaction: TransactionCreate
  ): Promise<FinancialTransaction> {
    if (!transaction.property_id) {
      throw new Error("Property ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating financial transaction:", error);
      throw error;
    }
  }

  /**
   * Update a financial transaction
   */
  static async updateTransaction(
    id: string,
    updates: Partial<FinancialTransaction>
  ): Promise<FinancialTransaction> {
    if (!id) {
      throw new Error("Transaction ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating financial transaction:", error);
      throw error;
    }
  }

  /**
   * Delete a financial transaction
   */
  static async deleteTransaction(id: string): Promise<void> {
    if (!id) {
      throw new Error("Transaction ID is required");
    }

    try {
      const supabase = await createSPASassClient();
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting financial transaction:", error);
      throw error;
    }
  }

  /**
   * Calculate financial summary for a property
   */
  static async getFinancialSummary(propertyId: string) {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      const transactions = await this.getTransactions(propertyId);

      // Calculate total income
      const incomeTransactions = transactions.filter(
        (t) => t.transaction_type === "income"
      );
      const totalIncome = incomeTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      // Calculate total expenses
      const expenseTransactions = transactions.filter(
        (t) => t.transaction_type === "expense"
      );
      const totalExpenses = expenseTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      // Calculate cash flow
      const cashFlow = totalIncome - totalExpenses;

      // Group transactions by category
      const incomeByCategory =
        this.groupTransactionsByCategory(incomeTransactions);
      const expensesByCategory =
        this.groupTransactionsByCategory(expenseTransactions);

      return {
        totalIncome,
        totalExpenses,
        cashFlow,
        incomeByCategory,
        expensesByCategory,
        currency: transactions.length > 0 ? transactions[0].currency : "USD",
      };
    } catch (error) {
      console.error("Error calculating financial summary:", error);
      throw error;
    }
  }

  /**
   * Helper function to group transactions by category
   */
  private static groupTransactionsByCategory(
    transactions: FinancialTransaction[]
  ) {
    return transactions.reduce((grouped, transaction) => {
      const category = transaction.category;
      if (!grouped[category]) {
        grouped[category] = {
          total: 0,
          transactions: [],
        };
      }

      grouped[category].total += transaction.amount;
      grouped[category].transactions.push(transaction);

      return grouped;
    }, {} as Record<string, { total: number; transactions: FinancialTransaction[] }>);
  }
}
