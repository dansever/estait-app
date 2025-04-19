"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { createSPASassClient } from "@/lib/supabase/client";
import { Database, Constants } from "@/lib/types";
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  CheckCheck,
  LayoutList,
  Clock10,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PropertyMaintenanceProps {
  propertyId: string;
  isLoading: boolean;
}

interface MaintenanceTask {
  id: string;
  title: string;
  description: string | null;
  task_status: Database["public"]["Enums"]["TASK_STATUS"];
  priority: Database["public"]["Enums"]["PRIORITY"] | null;
  created_at: string | null;
  due_date: string | null;
  property_id?: string | null;
  updated_at?: string | null;
}

export default function PropertyMaintenance({
  propertyId,
  isLoading,
}: PropertyMaintenanceProps) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    due_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch maintenance tasks for this property
  useEffect(() => {
    async function fetchMaintenanceTasks() {
      try {
        setLoadingTasks(true);

        const supabase = await createSPASassClient();
        const { data, error } = await supabase
          .from("maintenance_tasks")
          .select("*")
          .eq("property_id", propertyId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setTasks(data);
        }
      } catch (err) {
        console.error("Error fetching maintenance tasks:", err);
        // Use mock data in case of error
        setTasks(getMockTasks());
      } finally {
        setLoadingTasks(false);
      }
    }

    if (propertyId) {
      fetchMaintenanceTasks();
    }
  }, [propertyId]);

  const getMockTasks = (): MaintenanceTask[] => {
    return [
      {
        id: "1",
        title: "Fix leaking kitchen faucet",
        description:
          "The kitchen sink faucet has been leaking steadily. Needs to be fixed asap before it causes water damage.",
        task_status: "open",
        priority: "high",
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "Replace living room light fixtures",
        description:
          "The living room ceiling light is flickering and needs to be replaced.",
        task_status: "open",
        priority: "medium",
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Annual HVAC maintenance",
        description:
          "Schedule the annual maintenance for the HVAC system before winter.",
        task_status: "completed",
        priority: "medium",
        created_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        title: "Repaint bathroom ceiling",
        description:
          "The bathroom ceiling has some mold spots that need to be treated and repainted.",
        task_status: "open",
        priority: "low",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        title: "Fix broken window blinds",
        description:
          "The blinds in the master bedroom are broken and need to be replaced.",
        task_status: "open",
        priority: "low",
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        due_date: null,
      },
    ];
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setNewTask({
      ...newTask,
      [id]: value,
    });
  };

  // Create a new maintenance task
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.priority) {
      // You could add validation feedback here
      return;
    }

    try {
      setIsSubmitting(true);

      const supabase = await createSPASassClient();

      const taskToInsert = {
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority as Database["public"]["Enums"]["PRIORITY"],
        due_date: newTask.due_date || null,
        property_id: propertyId,
        task_status: "open" as Database["public"]["Enums"]["TASK_STATUS"],
      };

      const { data, error } = await supabase
        .from("maintenance_tasks")
        .insert(taskToInsert)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTasks((prevTasks) => [data, ...prevTasks]);
        setShowNewTaskDialog(false);
        resetNewTaskForm();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task status (e.g., mark as completed)
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: "open" | "completed"
  ) => {
    try {
      const supabase = await createSPASassClient();

      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          task_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, task_status: newStatus } : task
        )
      );

      // Close dialog if open
      if (showTaskDetailsDialog && selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, task_status: newStatus });
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (task: MaintenanceTask) => {
    try {
      const supabase = await createSPASassClient();

      const { error } = await supabase
        .from("maintenance_tasks")
        .delete()
        .eq("id", task.id);

      if (error) throw error;

      // Update local state
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

      // Close dialog if open
      if (showTaskDetailsDialog) {
        setShowTaskDetailsDialog(false);
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Reset form after submission
  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "",
      due_date: "",
    });
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return task.task_status === "open";
    if (activeTab === "completed") return task.task_status === "completed";
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString();
  };

  // Get relative time description
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "";

    const taskDate = new Date(dateString);
    const now = new Date();
    const diffTime = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    } else {
      return "Due today";
    }
  };

  // Get status badge
  const getStatusBadge = (task_status: string) => {
    switch (task_status) {
      case "open":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            <Clock className="h-3 w-3 mr-1" /> Open
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCheck className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-orange-600">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setShowTaskDetailsDialog(true);
  };

  const handleEditTask = (task: MaintenanceTask) => {
    // Implement edit functionality
    console.log("Edit task:", task.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Maintenance & Tasks</h2>
        </div>
        <Button onClick={() => setShowNewTaskDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Task filters */}
      <div>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="all" className="flex items-center">
              <LayoutList className="h-4 w-4 mr-2" /> All Tasks
            </TabsTrigger>
            <TabsTrigger value="open" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Open
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tasks list */}
      <div>
        {loadingTasks ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`hover:shadow-md transition-shadow border-l-4 
                  ${
                    task.task_status === "completed"
                      ? "border-l-green-500"
                      : task.task_status === "open"
                      ? "border-l-blue-500"
                      : task.priority === "high"
                      ? "border-l-red-500"
                      : task.priority === "medium"
                      ? "border-l-orange-500"
                      : "border-l-green-300"
                  }`}
                onClick={() => handleViewTask(task)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{task.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getStatusBadge(task.task_status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="flex items-center justify-end">
                        <Clock10 className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {task.due_date && getRelativeTime(task.due_date)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTask(task);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {task.due_date && (
                        <div className="text-sm">
                          <span className="text-gray-500">Due:</span>{" "}
                          {formatDate(task.due_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Tasks Found</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                {activeTab !== "all"
                  ? `There are no ${activeTab} tasks for this property.`
                  : "This property doesn't have any maintenance tasks yet."}
              </p>
              <Button onClick={() => setShowNewTaskDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Maintenance Task</DialogTitle>
            <DialogDescription>
              Add a new maintenance or repair task for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance task in detail"
                className="min-h-[100px]"
                value={newTask.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="priority"
                  className="w-full p-2 border rounded-md"
                  value={newTask.priority}
                  onChange={handleInputChange}
                >
                  <option value="">Select priority</option>
                  {Constants.public.Enums.PRIORITY.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">
                  Due Date
                </label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTask.due_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTaskDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog
          open={showTaskDetailsDialog}
          onOpenChange={setShowTaskDetailsDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{selectedTask.title}</span>
                {getStatusBadge(selectedTask.task_status)}
              </DialogTitle>
              <DialogDescription>
                Task created on {formatDate(selectedTask.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">
                  Priority:
                </span>
                {getPriorityBadge(selectedTask.priority)}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  Description:
                </p>
                <p className="text-sm">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Due Date:</p>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(selectedTask.due_date)}
                  </p>
                  {selectedTask.due_date && (
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(selectedTask.due_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="sm:mr-auto"
                onClick={() => setShowTaskDetailsDialog(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="sm:order-last"
                onClick={() => handleEditTask(selectedTask)}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button
                onClick={() =>
                  handleUpdateTaskStatus(selectedTask.id, "completed")
                }
              >
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
