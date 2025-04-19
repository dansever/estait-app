export const formatPaymentFrequency = (frequency: string) => {
  switch (frequency) {
    case "monthly":
      return "Monthly";
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every 2 Weeks";
    case "quarterly":
      return "Quarterly";
    case "annually":
      return "Annually";
    default:
      return "Unknown";
  }
};

/**
 * Returns the ordinal suffix for a number (e.g., "st" for 1, "nd" for 2)
 * @param day Number to get ordinal suffix for
 * @returns The ordinal suffix as a string
 */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Calculates the next payment date based on lease payment due day
 * @param lease The lease object containing payment_due_day and lease_end
 * @returns Formatted date string for the next payment date
 */
export function calculateNextPaymentDate(lease: {
  payment_due_day?: number | null;
  lease_end?: string | null;
}): string {
  if (!lease.payment_due_day) return "Not scheduled";
  if (!lease.lease_end) return "Not scheduled";

  const now = new Date();
  const endDate = new Date(lease.lease_end);

  // If lease has ended, no more payments
  if (now > endDate) return "No more payments due";

  const dueDay = lease.payment_due_day;
  let nextPayment = new Date(now.getFullYear(), now.getMonth(), dueDay);

  // If due day has passed this month, move to next month
  if (now.getDate() > dueDay) {
    nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }

  // Format the date
  return nextPayment.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date string to a human-readable format
 * @param dateString The date string to format
 * @returns Formatted date string or "N/A" if null
 */
export function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculates the remaining time in a lease
 * @param endDate The end date of the lease
 * @returns String representation of the remaining time
 */
export function getRemainingTime(endDate: string | null) {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();

  if (diffTime <= 0) return "Expired";

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}
