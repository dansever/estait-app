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
