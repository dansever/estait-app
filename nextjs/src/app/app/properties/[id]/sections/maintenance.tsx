"use client";

import { useState } from "react";
import { EnrichedProperty } from "@/lib/enrichedPropertyType";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  LayoutList,
  Clock,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  CalendarDays,
  AlertTriangle,
  Search,
  Info,
  X,
} from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Constants } from "@/lib/types";
import MaintenanceTaskCard from "@/components/property/maintenance/MaintenanceTaskCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Maintenance & Tasks
              </CardTitle>
              <CardDescription className="mt-1.5">
                Manage tasks and maintenance requests for this property
              </CardDescription>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Control Panel */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50 p-3 rounded-lg">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full md:w-auto bg-slate-100">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-1 text-sm"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">All Tasks</span>
                  <span className="sm:hidden">All</span>
                  <Badge
                    variant="outline"
                    className="ml-1 bg-slate-200 text-slate-700 hover:bg-slate-200"
                  >
                    {rawTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="open"
                  className="flex items-center gap-1 text-sm"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open</span>
                  <Badge
                    variant="outline"
                    className="ml-1 bg-slate-200 text-slate-700 hover:bg-slate-200"
                  >
                    {rawTasks.filter((t) => t.task_status === "open").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center gap-1 text-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Done</span>
                  <Badge
                    variant="outline"
                    className="ml-1 bg-slate-200 text-slate-700 hover:bg-slate-200"
                  >
                    {
                      rawTasks.filter((t) => t.task_status === "completed")
                        .length
                    }
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <div className="relative w-full md:w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-blue-500"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-slate-200 text-slate-600"
                  >
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Low Priority
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
                    Has Due Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-slate-200 text-slate-600"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline mr-1">Sort</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-slate-100 text-xs font-normal"
                    >
                      {sortMode === "date" ? "Due Date" : "Priority"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => setSortMode("date")}
                    className="cursor-pointer"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    By Due Date
                    {sortMode === "date" && (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortMode("urgency")}
                    className="cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    By Priority
                    {sortMode === "urgency" && (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Task List */}
          <AnimatePresence>
            {filteredTasks.length === 0 && !creatingTask ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-50 border border-dashed border-slate-200">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-slate-100 p-3 mb-3">
                      <Info className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-1">
                      No tasks found
                    </h3>
                    <p className="text-slate-500 max-w-md mb-4">
                      {activeTab === "all"
                        ? "You haven't created any tasks for this property yet."
                        : activeTab === "open"
                        ? "There are no open tasks at the moment."
                        : "You haven't completed any tasks yet."}
                    </p>
                    {activeTab !== "completed" && (
                      <Button
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
                        variant="outline"
                        className="bg-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first task
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <ScrollArea className="h-[550px] pr-4">
                <div className="space-y-3">
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
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <MaintenanceTaskCard
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
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
