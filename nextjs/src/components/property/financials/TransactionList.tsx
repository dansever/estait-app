import { formatCurrency } from "@/components/property/lease/lease-utils";
import { FinancialTransaction } from "@/lib/services/FinancialService";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: FinancialTransaction[];
  onView?: (transaction: FinancialTransaction) => void;
  onEdit?: (transaction: FinancialTransaction) => void;
  onDelete?: (transaction: FinancialTransaction) => void;
}

// Helper function to get appropriate badge color based on transaction type
function getTransactionBadge(type: string) {
  if (type === "income") {
    return <Badge className="bg-green-600">Income</Badge>;
  } else {
    return <Badge className="bg-red-600">Expense</Badge>;
  }
}

// Helper function to get category badge
function getCategoryBadge(category: string) {
  switch (category.toLowerCase()) {
    case "rent":
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          Rent
        </Badge>
      );
    case "mortgage":
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          Mortgage
        </Badge>
      );
    case "utilities":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Utilities
        </Badge>
      );
    case "maintenance":
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Maintenance
        </Badge>
      );
    case "tax":
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-600">
          Tax
        </Badge>
      );
    case "insurance":
      return (
        <Badge variant="outline" className="border-indigo-500 text-indigo-600">
          Insurance
        </Badge>
      );
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
}

export function TransactionList({
  transactions,
  onView,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>
                {getTransactionBadge(transaction.transaction_type)}
              </TableCell>
              <TableCell>{getCategoryBadge(transaction.category)}</TableCell>
              <TableCell>{transaction.description || "-"}</TableCell>
              <TableCell className="text-right font-medium">
                <span
                  className={
                    transaction.transaction_type === "expense"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {transaction.transaction_type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDelete(transaction)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
