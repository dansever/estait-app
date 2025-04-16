import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

type MaintenanceTask = Database["public"]["Tables"]["maintenance_tasks"]["Row"];
type NewMaintenanceTask =
  Database["public"]["Tables"]["maintenance_tasks"]["Insert"];
type UpdateMaintenanceTask =
  Database["public"]["Tables"]["maintenance_tasks"]["Update"] & { id: string };

// Get all maintenance tasks (optional filter by property or status)
export async function getMaintenanceTasks(filter?: {
  property_id?: string;
  status?: string;
}): Promise<MaintenanceTask[]> {
  const client = await createSPASassClient();
  let query = client
    .from("maintenance_tasks")
    .select("*")
    .order("due_date", { ascending: true });

  if (filter?.property_id) query = query.eq("property_id", filter.property_id);
  if (filter?.status) query = query.eq("status", filter.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Get task by ID
export async function getMaintenanceTaskById(
  id: string
): Promise<MaintenanceTask | null> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("maintenance_tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Create a new maintenance task
export async function createMaintenanceTask(
  payload: NewMaintenanceTask
): Promise<MaintenanceTask> {
  const client = await createSPASassClient();
  const { data, error } = await client
    .from("maintenance_tasks")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a maintenance task
export async function updateMaintenanceTask(
  update: UpdateMaintenanceTask
): Promise<MaintenanceTask> {
  const { id, ...fields } = update;
  const client = await createSPASassClient();

  const { data, error } = await client
    .from("maintenance_tasks")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a maintenance task
export async function deleteMaintenanceTask(id: string): Promise<void> {
  const client = await createSPASassClient();
  const { error } = await client
    .from("maintenance_tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
