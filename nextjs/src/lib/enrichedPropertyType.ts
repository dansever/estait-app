import { Database } from "@/lib/types";

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type LeaseRow = Database["public"]["Tables"]["leases"]["Row"];
export type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type TransactionRow =
  Database["public"]["Tables"]["transactions"]["Row"];
export type TasksRow = Database["public"]["Tables"]["maintenance_tasks"]["Row"];

export type EnrichedProperty = {
  rawProperty: PropertyRow;
  rawLease?: LeaseRow | null;
  rawPastLeases?: LeaseRow[];
  rawAddress?: AddressRow;
  rawDocuments?: DocumentRow[];
  rawTransactions?: TransactionRow[];
  rawTasks?: TasksRow[];
};
