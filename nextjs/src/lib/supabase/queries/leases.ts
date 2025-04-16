import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Lease = Database["public"]["Tables"]["leases"]["Row"];
type NewLease = Database["public"]["Tables"]["leases"]["Insert"];
type UpdateLease = Database["public"]["Tables"]["leases"]["Update"] & {
  id: string;
};

// Get all leases (with optional filters)
export async function getLeases(filter?: {
  property_id?: string;
  tenant_id?: string;
  status?: string;
}): Promise<Lease[]> {
  const client = await createSPASassClient();
  let query = client
    .from("leases")
    .select("*")
    .order("lease_start", { ascending: false });

  if (filter?.property_id) query = query.eq("property_id", filter.property_id);
  if (filter?.tenant_id) query = query.eq("tenant_id", filter.tenant_id);
  if (filter?.status) query = query.eq("status", filter.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Get lease by ID
export async function getLeaseById(id: string): Promise<Lease | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("leases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new lease
export async function createLease(payload: NewLease): Promise<Lease> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("leases")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a lease
export async function updateLease(update: UpdateLease): Promise<Lease> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("leases")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a lease
export async function deleteLease(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("leases").delete().eq("id", id);

  if (error) throw error;
}
