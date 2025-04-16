import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Address = Database["public"]["Tables"]["addresses"]["Row"];
type NewAddress = Database["public"]["Tables"]["addresses"]["Insert"];
type UpdateAddress = Database["public"]["Tables"]["addresses"]["Update"] & {
  id: string;
};

// Get all addresses
export async function getAllAddresses(): Promise<Address[]> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("addresses")
    .select("*")
    .order("city", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Get address by ID
export async function getAddressById(id: string): Promise<Address | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("addresses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new address
export async function createAddress(payload: NewAddress): Promise<Address> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("addresses")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update an address
export async function updateAddress(update: UpdateAddress): Promise<Address> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("addresses")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete an address
export async function deleteAddress(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("addresses").delete().eq("id", id);

  if (error) throw error;
}
