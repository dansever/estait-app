import { createSPASassClient } from "@/lib/supabase/client";

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  property_id: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  task_status: string;
  priority: string | null;
  assigned_to: string | null;
}

export interface MaintenanceTaskCreate {
  title: string;
  description: string;
  property_id: string;
  due_date?: string | null;
  task_status: string;
  priority?: string | null;
  assigned_to?: string | null;
}

/**
 * Service class for handling property maintenance tasks
 */
export class MaintenanceService {
  /**
   * Get all maintenance tasks for a property
   */
  static async getTasks(propertyId: string): Promise<MaintenanceTask[]> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get tasks filtered by status
   */
  static async getTasksByStatus(
    propertyId: string,
    status: string
  ): Promise<MaintenanceTask[]> {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .select("*")
      .eq("property_id", propertyId)
      .eq("task_status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new maintenance task
   */
  static async createTask(
    task: MaintenanceTaskCreate
  ): Promise<MaintenanceTask> {
    if (!task.property_id) {
      throw new Error("Property ID is required");
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a maintenance task
   */
  static async updateTask(
    id: string,
    updates: Partial<MaintenanceTask>
  ): Promise<MaintenanceTask> {
    if (!id) {
      throw new Error("Task ID is required");
    }

    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .from("maintenance_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    id: string,
    status: string
  ): Promise<MaintenanceTask> {
    return this.updateTask(id, { task_status: status });
  }

  /**
   * Delete a maintenance task
   */
  static async deleteTask(id: string): Promise<void> {
    if (!id) {
      throw new Error("Task ID is required");
    }

    const supabase = await createSPASassClient();
    const { error } = await supabase
      .from("maintenance_tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
