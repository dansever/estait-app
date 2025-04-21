import { Constants } from "@/lib/types";
import { currencyList } from "./constants";

export type PaymentFrequency =
  (typeof Constants.public.Enums.PAYMENT_FREQUENCY)[number];

// Get currency symbol by code
export const getCurrencySymbol = (code: string): string => {
  const option = currencyList().find((c) => c.code === code);
  return option?.symbol || "$";
};

// Format currency with symbol (e.g., "$1,200")
export const formatCurrency = (
  amount: number | null | undefined,
  currencyCode?: string
): string => {
  if (amount === undefined || amount === null) return "N/A";
  const symbol = getCurrencySymbol(currencyCode || "USD");
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}`;
};

export function formatPaymentFrequency(frequency: PaymentFrequency): string {
  const map: Record<PaymentFrequency, string> = {
    weekly: "/ week",
    biweekly: "Every 2 weeks",
    monthly: "/ month",
    quarterly: "Every 3 months",
    annually: "/ year",
  };
  return map[frequency] ?? "";
}
