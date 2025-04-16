import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type NewTenant = Database["public"]["Tables"]["tenants"]["Insert"];
type UpdateTenant = Database["public"]["Tables"]["tenants"]["Update"] & {
  id: string;
};

// Get all tenants
export async function getAllTenants(): Promise<Tenant[]> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Get tenant by ID
export async function getTenantById(id: string): Promise<Tenant | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new tenant
export async function createTenant(payload: NewTenant): Promise<Tenant> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("tenants")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update an existing tenant
export async function updateTenant(update: UpdateTenant): Promise<Tenant> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();

  const { data, error } = await client
    .from("tenants")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a tenant
export async function deleteTenant(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("tenants").delete().eq("id", id);

  if (error) throw error;
}
