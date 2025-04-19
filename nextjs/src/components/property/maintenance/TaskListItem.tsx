import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { MaintenanceTask } from "@/lib/services/MaintenanceService";
import { formatDate } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: string;
}

interface TaskPriorityBadgeProps {
  priority: string | null;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-600">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-orange-600">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-green-600">Completed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
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
}

interface TaskListItemProps {
  task: MaintenanceTask;
  onView: (task: MaintenanceTask) => void;
  onEdit: (task: MaintenanceTask) => void;
  onDelete: (task: MaintenanceTask) => void;
}

export function TaskListItem({
  task,
  onView,
  onEdit,
  onDelete,
}: TaskListItemProps) {
  const getBorderColor = () => {
    if (task.task_status === "completed") return "border-l-green-500";
    if (task.task_status === "open") return "border-l-blue-500";
    if (task.priority === "high") return "border-l-red-500";
    if (task.priority === "medium") return "border-l-orange-500";
    return "border-l-green-300";
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow border-l-4 ${getBorderColor()}`}
      onClick={() => onView(task)}
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
              <TaskStatusBadge status={task.task_status} />
              {task.priority && <TaskPriorityBadge priority={task.priority} />}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(task);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
  );
}
