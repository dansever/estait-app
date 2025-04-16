import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type NewTransaction = Database["public"]["Tables"]["transactions"]["Insert"];
type UpdateTransaction =
  Database["public"]["Tables"]["transactions"]["Update"] & { id: string };

// Get all transactions (optionally filter by property or lease)
export async function getTransactions(filter?: {
  property_id?: string;
  lease_id?: string;
}): Promise<Transaction[]> {
  const client = await createSPASassClient();
  let query = client
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (filter?.property_id) {
    query = query.eq("property_id", filter.property_id);
  }
  if (filter?.lease_id) {
    query = query.eq("lease_id", filter.lease_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Get a single transaction by ID
export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new transaction
export async function createTransaction(
  payload: NewTransaction
): Promise<Transaction> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("transactions")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a transaction
export async function updateTransaction(
  update: UpdateTransaction
): Promise<Transaction> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("transactions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("transactions").delete().eq("id", id);

  if (error) throw error;
}
