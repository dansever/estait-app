import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil } from "lucide-react";
import { MaintenanceTask } from "@/lib/services/MaintenanceService";
import { formatDate } from "@/lib/utils";
import { TaskPriorityBadge, TaskStatusBadge } from "./TaskListItem";

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask;
  onEdit: (task: MaintenanceTask) => void;
  onMarkComplete: (taskId: string) => Promise<void>;
}

export function TaskDetailsDialog({
  isOpen,
  onClose,
  task,
  onEdit,
  onMarkComplete,
}: TaskDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Due in ${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `Overdue by ${Math.abs(diffDays)} ${
        Math.abs(diffDays) === 1 ? "day" : "days"
      }`;
    }
  };

  const handleMarkComplete = async () => {
    try {
      setIsUpdating(true);
      await onMarkComplete(task.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{task.title}</span>
            <TaskStatusBadge status={task.task_status} />
          </DialogTitle>
          <DialogDescription>
            Task created on {formatDate(task.created_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-500">Priority:</span>
            <TaskPriorityBadge priority={task.priority} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Description:</p>
            <p className="text-sm">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Due Date:</p>
              <p className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                {formatDate(task.due_date)}
              </p>
              {task.due_date && (
                <p className="text-xs text-gray-500">
                  {getRelativeTime(task.due_date)}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="sm:mr-auto" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            className="sm:order-last"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          {task.task_status !== "completed" && (
            <Button onClick={handleMarkComplete} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Mark as Completed"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
