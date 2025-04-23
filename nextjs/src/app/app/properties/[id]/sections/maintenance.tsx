"use client";

import { useState } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  LayoutList,
  Clock,
  CheckCircle2,
  Clock10,
  Pencil,
  Trash2,
} from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import MaintenanceTaskCard from "@/components/property/maintenance/MaintenanceTaskCard";

export default function Maintenance({
  data,
  refreshData,
}: {
  data: EnrichedProperty;
  refreshData: () => void;
}) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [sortMode, setSortMode] = useState<"urgency" | "date">("date");
  const [activeTab, setActiveTab] = useState("all");

  const { rawTasks } = data;

  const filteredTasks = rawTasks.filter((task) => {
    if (activeTab === "all") return true;
    return task.task_status === activeTab;
  });

  const sortPriority = { high: 1, medium: 2, low: 3, null: 4 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortMode === "date") {
      const dateA = new Date(a.due_date || "").getTime();
      const dateB = new Date(b.due_date || "").getTime();
      if (dateA === dateB) {
        return (
          sortPriority[a.priority || "null"] -
          sortPriority[b.priority || "null"]
        );
      }
      return dateA - dateB;
    } else {
      const priA = sortPriority[a.priority || "null"];
      const priB = sortPriority[b.priority || "null"];
      if (priA === priB) {
        const dateA = new Date(a.due_date || "").getTime();
        const dateB = new Date(b.due_date || "").getTime();
        return dateA - dateB;
      }
      return priA - priB;
    }
  });

  const toggleTaskStatus = async (
    taskId: string,
    current: "open" | "completed"
  ) => {
    // Optimistic UI: update local task status instantly
    const newStatus = current === "completed" ? "open" : "completed";
    const updatedTasks = data.rawTasks.map((task) =>
      task.id === taskId ? { ...task, task_status: newStatus } : task
    );
    data.rawTasks = updatedTasks;

    setUpdatingTaskId(taskId); // optional: show loading indicator

    const supabase = await createSPASassClient();
    await supabase.updateTask(taskId, { task_status: newStatus });

    setUpdatingTaskId(null);
    refreshData(); // re-fetch from backend for full sync
  };

  const deleteTask = async (taskId: string) => {
    const supabase = await createSPASassClient();
    await supabase.deleteTask(taskId);
    refreshData();
  };

  const saveEditTask = async (taskId: string) => {
    if (!editTaskData) return;
    const supabase = await createSPASassClient();
    const { isNew, ...taskData } = editTaskData;

    if (isNew) {
      await supabase.addTask(data.rawProperty.id, {
        ...taskData,
        task_status: "open",
      });
    } else {
      await supabase.updateTask(taskId, taskData);
    }

    setEditTaskId(null);
    setEditTaskData(null);
    setCreatingTask(false);
    refreshData();
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant="outline"
        className={
          status === "completed"
            ? "border-green-500 text-green-600"
            : "border-yellow-500 text-yellow-600"
        }
      >
        {status === "completed" ? "Completed" : "Open"}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const color =
      priority === "high"
        ? "bg-red-500"
        : priority === "medium"
        ? "bg-orange-500"
        : "bg-green-500";
    return <Badge className={color}>{priority}</Badge>;
  };

  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Due today";
    if (diff > 0) return `Due in ${diff} day${diff > 1 ? "s" : ""}`;
    return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""}`;
  };

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance & Tasks</CardTitle>
          <CardDescription>
            Manage tasks and maintenance requests for your property.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            onClick={() => {
              const id = `temp-${Date.now()}`;
              setEditTaskId(id);
              setEditTaskData({
                title: "",
                description: "",
                priority: "medium",
                due_date: "",
                isNew: true,
              });
              setCreatingTask(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
          <div className="flex justify-between items-center">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3 lg:w-auto lg:inline-flex">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-secondary"
                >
                  <LayoutList className="h-4 w-4 mr-2" /> All
                </TabsTrigger>
                <TabsTrigger
                  value="open"
                  className="data-[state=active]:bg-secondary"
                >
                  <Clock className="h-4 w-4 mr-2" /> Open
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-secondary"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortMode((prev) => (prev === "date" ? "urgency" : "date"))
              }
            >
              Sort: {sortMode === "date" ? "Due Date" : "Urgency"}
            </Button>
          </div>

          {filteredTasks.length === 0 && !creatingTask ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No tasks found for this view.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {[
                ...(creatingTask
                  ? [
                      {
                        id: editTaskId!,
                        title: editTaskData?.title || "New Task",
                        description: editTaskData?.description || "",
                        priority: editTaskData?.priority || "medium",
                        due_date: editTaskData?.due_date || "",
                        task_status: "open",
                      },
                    ]
                  : []),
                ...sortedTasks,
              ].map((task) => (
                <MaintenanceTaskCard
                  key={task.id}
                  task={task}
                  editTaskId={editTaskId}
                  editTaskData={editTaskData}
                  updatingTaskId={updatingTaskId}
                  setEditTaskId={setEditTaskId}
                  setEditTaskData={setEditTaskData}
                  toggleTaskStatus={toggleTaskStatus}
                  deleteTask={deleteTask}
                  saveEditTask={saveEditTask}
                  setCreatingTask={setCreatingTask}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
