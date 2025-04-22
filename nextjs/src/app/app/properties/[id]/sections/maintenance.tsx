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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
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
import { format } from "date-fns";

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
    await supabase.removeTask(taskId);
    refreshData();
  };

  const saveEditTask = async (taskId: string) => {
    if (!editTaskData) return;
    const supabase = await createSPASassClient();

    if (editTaskData.isNew) {
      await supabase.addTask({
        ...editTaskData,
        property_id: data.rawProperty.id,
        task_status: "open",
      });
    } else {
      await supabase.updateTask(taskId, editTaskData);
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
              const id = `temp-${Date.now()}`; // temporary ID for local UI
              setEditTaskId(id);
              setEditTaskData({
                title: "New Task",
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

          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No tasks found for this view.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`hover:shadow-md transition-shadow border-l-4 
                ${
                  task.task_status === "completed"
                    ? "border-l-green-500"
                    : task.priority === "high"
                    ? "border-l-red-500"
                    : task.priority === "medium"
                    ? "border-l-orange-500"
                    : "border-l-gray-300"
                }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{task.title}</h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getStatusBadge(task.task_status)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock10 className="h-4 w-4" />
                          {getRelativeTime(task.due_date)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleTaskStatus(task.id, task.task_status)
                            }
                            disabled={updatingTaskId === task.id}
                          >
                            <CheckCircle2
                              className={`h-8 w-8 ${
                                task.task_status === "completed"
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditTaskId(task.id);
                              setEditTaskData({
                                title: task.title,
                                description: task.description || "",
                                priority: task.priority || "medium",
                                due_date: task.due_date || "",
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {editTaskId === task.id && (
                      <div className="mt-4 space-y-2">
                        <Input
                          value={editTaskData?.title || ""}
                          onChange={(e) =>
                            setEditTaskData((prev) => ({
                              ...prev!,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Task title"
                        />
                        <Input
                          value={editTaskData?.description || ""}
                          onChange={(e) =>
                            setEditTaskData((prev) => ({
                              ...prev!,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Description"
                        />
                        <div className="flex gap-4">
                          <select
                            value={editTaskData?.priority}
                            onChange={(e) =>
                              setEditTaskData((prev) => ({
                                ...prev!,
                                priority: e.target.value,
                              }))
                            }
                            className="border rounded px-2 py-1"
                          >
                            {Constants.public.Enums.PRIORITY.map((p) => (
                              <option key={p} value={p}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="date"
                            value={editTaskData?.due_date || ""}
                            onChange={(e) =>
                              setEditTaskData((prev) => ({
                                ...prev!,
                                due_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEditTask(task.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditTaskId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
