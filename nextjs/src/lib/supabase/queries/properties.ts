import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type NewProperty = Database["public"]["Tables"]["properties"]["Insert"];
type UpdateProperty = Database["public"]["Tables"]["properties"]["Update"] & {
  id: string;
};

// Get all properties for a given owner
export async function getPropertiesByOwner(
  ownerId: string
): Promise<Property[]> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new property
export async function createProperty(payload: NewProperty): Promise<Property> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("properties")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update an existing property
export async function updateProperty(
  update: UpdateProperty
): Promise<Property> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();

  const { data, error } = await client
    .from("properties")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a property
export async function deleteProperty(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("properties").delete().eq("id", id);

  if (error) throw error;
}
