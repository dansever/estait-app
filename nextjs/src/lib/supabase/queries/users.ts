import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type User = Database["public"]["Tables"]["users"]["Row"];
type NewUser = Database["public"]["Tables"]["users"]["Insert"];
type UpdateUser = Database["public"]["Tables"]["users"]["Update"] & {
  id: string;
};

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Get all users (optional)
export async function getAllUsers(): Promise<User[]> {
  const client = await createSPASassClient();
  const { data, error } = await client.from("users").select("*");

  if (error) throw error;
  return data ?? [];
}

// Create a new user
export async function createUser(payload: NewUser): Promise<User> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a user
export async function updateUser(update: UpdateUser): Promise<User> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("users")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client.from("users").delete().eq("id", id);

  if (error) throw error;
}
