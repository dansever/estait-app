import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TransactionCreate,
  FinancialTransaction,
} from "@/lib/services/FinancialService";
import { formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionFormData {
  date: string;
  amount: string;
  transaction_type: string;
  category: string;
  currency: string;
  description: string;
}

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionCreate) => Promise<void>;
  propertyId: string;
  initialData?: FinancialTransaction;
  isEdit?: boolean;
}

const DEFAULT_FORM_DATA: TransactionFormData = {
  date: formatDate(new Date().toISOString()),
  amount: "",
  transaction_type: "expense",
  category: "",
  currency: "USD",
  description: "",
};

const TRANSACTION_CATEGORIES = {
  income: ["Rent", "Deposit", "Other Income"],
  expense: [
    "Mortgage",
    "Utilities",
    "Maintenance",
    "Tax",
    "Insurance",
    "Other Expense",
  ],
};

export function TransactionFormDialog({
  isOpen,
  onClose,
  onSubmit,
  propertyId,
  initialData,
  isEdit = false,
}: TransactionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>(
    initialData
      ? {
          date: formatDate(initialData.date),
          amount: initialData.amount.toString(),
          transaction_type: initialData.transaction_type,
          category: initialData.category,
          currency: initialData.currency,
          description: initialData.description || "",
        }
      : DEFAULT_FORM_DATA
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const transactionData: TransactionCreate = {
        property_id: propertyId,
        date: formData.date,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        category: formData.category,
        currency: formData.currency,
        description: formData.description || null,
      };

      await onSubmit(transactionData);

      // Reset form on success
      if (!isEdit) {
        setFormData(DEFAULT_FORM_DATA);
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple validation for required fields
  const isValid =
    formData.date.trim() !== "" &&
    !isNaN(parseFloat(formData.amount)) &&
    parseFloat(formData.amount) > 0 &&
    formData.transaction_type.trim() !== "" &&
    formData.category.trim() !== "" &&
    formData.currency.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) =>
                  handleSelectChange("transaction_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {formData.transaction_type === "income"
                  ? TRANSACTION_CATEGORIES.income.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))
                  : TRANSACTION_CATEGORIES.expense.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add description (optional)"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
              ? "Update Transaction"
              : "Add Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
