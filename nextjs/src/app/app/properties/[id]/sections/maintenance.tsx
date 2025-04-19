"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, Plus, LayoutList, Wrench } from "lucide-react";
import {
  MaintenanceService,
  MaintenanceTask,
  MaintenanceTaskCreate,
} from "@/lib/services/MaintenanceService";
import { TaskListItem } from "@/components/property/maintenance/TaskListItem";
import { TaskDetailsDialog } from "@/components/property/maintenance/TaskDetailsDialog";
import { TaskFormDialog } from "@/components/property/maintenance/TaskFormDialog";
import { toast } from "sonner";

interface PropertyMaintenanceProps {
  propertyId: string;
  isLoading: boolean;
  onDataChanged?: () => Promise<void>;
}

export default function PropertyMaintenance({
  propertyId,
  isLoading,
  onDataChanged,
}: PropertyMaintenanceProps) {
  // State variables
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );

  // Load tasks when component mounts or property ID changes
  useEffect(() => {
    if (propertyId && !isLoading) {
      loadTasks();
    }
  }, [propertyId, isLoading]);

  // Load tasks from the backend
  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const data = await MaintenanceService.getTasks(propertyId);
      setTasks(data);
    } catch (error) {
      console.error("Error loading maintenance tasks:", error);
      toast.error("Failed to load maintenance tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    return task.task_status === activeTab;
  });

  // Handle task creation
  const handleCreateTask = async (newTask: MaintenanceTaskCreate) => {
    try {
      await MaintenanceService.createTask(newTask);
      await loadTasks();
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  // Handle editing a task (future implementation)
  const handleEditTask = (task: MaintenanceTask) => {
    // For future implementation
    console.log("Edit task:", task.id);
    toast.info("Edit functionality will be implemented soon");
  };

  // Handle task deletion
  const handleDeleteTask = async (task: MaintenanceTask) => {
    try {
      await MaintenanceService.deleteTask(task.id);
      await loadTasks();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle updating task status
  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await MaintenanceService.updateTaskStatus(taskId, status);
      await loadTasks();
      setShowTaskDetailsDialog(false);
      toast.success("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  // Handle viewing task details
  const handleViewTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setShowTaskDetailsDialog(true);
  };

  // Loading skeleton UI
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
            <TabsTrigger value="in_progress" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" /> In Progress
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
              <TaskListItem
                key={task.id}
                task={task}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
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
      <TaskFormDialog
        isOpen={showNewTaskDialog}
        onClose={() => setShowNewTaskDialog(false)}
        onSubmit={handleCreateTask}
        propertyId={propertyId}
      />

      {/* Task Details Dialog */}
      {selectedTask && (
        <TaskDetailsDialog
          isOpen={showTaskDetailsDialog}
          onClose={() => setShowTaskDetailsDialog(false)}
          task={selectedTask}
          onEdit={handleEditTask}
          onMarkComplete={(taskId) =>
            handleUpdateTaskStatus(taskId, "completed")
          }
        />
      )}
    </div>
  );
}
