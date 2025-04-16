"use client";

import React, { useState, useEffect } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Loader2,
  AlertCircle,
  ListChecks,
  CheckCheck,
} from "lucide-react";
import Confetti from "@/components/Confetti";
import { NavTabs, TabItem } from "@/components/layout/navTabs";
import TaskList from "@/components/TaskList";
import CreateTaskDialog from "@/components/CreateTaskDialog";

import { Database } from "@/lib/types";

type Task = Database["public"]["Tables"]["todo_list"]["Row"];

export default function TaskManagementPage() {
  const { user } = useGlobal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [filter, user?.id]);

  const loadTasks = async (): Promise<void> => {
    try {
      const isFirstLoad = initialLoading;
      if (!isFirstLoad) setLoading(true);

      const supabase = await createSPASassClient();
      const { data, error: supabaseError } = await supabase.getMyTodoList(
        1,
        100,
        "created_at",
        filter
      );

      if (supabaseError) throw supabaseError;
      setTasks(data || []);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleRemoveTask = async (id: number): Promise<void> => {
    try {
      const supabase = await createSPASassClient();
      const { error: supabaseError } = await supabase.removeTask(id.toString());
      if (supabaseError) throw supabaseError;
      await loadTasks();
    } catch (err) {
      setError("Failed to remove task");
      console.error("Error removing task:", err);
    }
  };

  const handleMarkAsDone = async (id: number): Promise<void> => {
    try {
      const supabase = await createSPASassClient();
      const { error: supabaseError } = await supabase.updateAsDone(
        id.toString()
      );
      if (supabaseError) throw supabaseError;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      await loadTasks();
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const taskTabs: TabItem[] = [
    {
      id: null,
      label: "All Tasks",
      icon: ListChecks,
      content: (
        <TaskList
          tasks={tasks}
          onMarkDone={handleMarkAsDone}
          onRemove={handleRemoveTask}
        />
      ),
    },
    {
      id: false,
      label: "Active",
      icon: Activity,
      content: (
        <TaskList
          tasks={tasks}
          filter={false}
          onMarkDone={handleMarkAsDone}
          onRemove={handleRemoveTask}
        />
      ),
    },
    {
      id: true,
      label: "Completed",
      icon: CheckCheck,
      content: (
        <TaskList
          tasks={tasks}
          filter={true}
          onMarkDone={handleMarkAsDone}
          onRemove={handleRemoveTask}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>Manage your tasks and to-dos</CardDescription>
          </div>
          <CreateTaskDialog onTaskCreated={loadTasks} />
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <NavTabs
            tabs={taskTabs}
            defaultTabId={filter}
            onChange={(tabId) => setFilter(tabId as boolean | null)}
          />
        </CardContent>
      </Card>
      <Confetti active={showConfetti} />
    </div>
  );
}
