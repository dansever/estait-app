"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Save,
  X,
  InfoIcon,
} from "lucide-react";
import { Constants } from "@/lib/types";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, isToday } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MaintenanceTaskCard({
  task,
  editTaskId,
  editTaskData,
  updatingTaskId,
  setEditTaskId,
  setEditTaskData,
  toggleTaskStatus,
  deleteTask,
  saveEditTask,
  setCreatingTask,
}: {
  task: any;
  editTaskId: string | null;
  editTaskData: any;
  updatingTaskId: string | null;
  setEditTaskId: (id: string | null) => void;
  setEditTaskData: (data: any) => void;
  toggleTaskStatus: (id: string, status: string) => void;
  deleteTask: (id: string) => void;
  saveEditTask: (id: string) => void;
  setCreatingTask: (val: boolean) => void;
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const isEditing =
    editTaskId === task.id || isEditingTitle || isEditingDescription;
  const isNewTask = task.id.toString().startsWith("temp-");

  // Handle clicks outside of editing components to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditingTitle &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        handleSaveInlineEdit();
        setIsEditingTitle(false);
      }

      if (
        isEditingDescription &&
        descriptionInputRef.current &&
        !descriptionInputRef.current.contains(event.target as Node)
      ) {
        handleSaveInlineEdit();
        setIsEditingDescription(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingTitle, isEditingDescription]);

  // Focus input field when editing begins
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }

    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }

    // Auto-focus on title when creating a new task
    if (isNewTask && titleInputRef.current && isEditingTitle) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle, isEditingDescription, isNewTask]);

  // Auto-start editing for new tasks
  useEffect(() => {
    if (isNewTask) {
      setIsEditingTitle(true);
    }
  }, [isNewTask]);

  const handleEditTitle = () => {
    setEditTaskId(task.id);
    setEditTaskData({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
    });
    setIsEditingTitle(true);
  };

  const handleEditDescription = () => {
    setEditTaskId(task.id);
    setEditTaskData({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
    });
    setIsEditingDescription(true);
  };

  const handleSaveInlineEdit = () => {
    if (editTaskId === task.id) {
      saveEditTask(task.id);
    }
  };

  const handleCancelEdit = () => {
    if (isNewTask) {
      setCreatingTask(false);
    }
    setEditTaskId(null);
    setEditTaskData(null);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };

  const priorityColors = {
    high: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: <AlertTriangle className="h-3 w-3" />,
      hover: "hover:bg-red-100",
    },
    medium: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      icon: <Clock className="h-3 w-3" />,
      hover: "hover:bg-orange-100",
    },
    low: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
      hover: "hover:bg-green-100",
    },
  };

  const getStatusBadge = (status: string) => (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant="outline"
          className={cn(
            "font-medium transition-colors",
            status === "completed"
              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              : "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
          )}
        >
          <span className="flex items-center gap-1">
            {status === "completed" ? (
              <>
                <CheckCircle className="h-3 w-3" /> Completed
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" /> Open
              </>
            )}
          </span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">
          {status === "completed"
            ? "Task has been completed"
            : "Task is still pending completion"}
        </p>
      </TooltipContent>
    </Tooltip>
  );

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) priority = "medium";

    const config = priorityColors[priority as keyof typeof priorityColors];

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              config.bg,
              config.border,
              config.text,
              config.hover,
              "font-medium cursor-pointer transition-colors"
            )}
          >
            <span className="flex items-center gap-1">
              {config.icon}
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-col gap-2">
            {Constants.public.Enums.PRIORITY.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className={cn(
                  priorityColors[p as keyof typeof priorityColors].bg,
                  priorityColors[p as keyof typeof priorityColors].border,
                  priorityColors[p as keyof typeof priorityColors].text,
                  priorityColors[p as keyof typeof priorityColors].hover,
                  "font-medium cursor-pointer px-3 py-1 transition-colors"
                )}
                onClick={() => {
                  if (editTaskId !== task.id) {
                    setEditTaskId(task.id);
                    setEditTaskData({
                      title: task.title,
                      description: task.description || "",
                      priority: p,
                      due_date: task.due_date || "",
                    });
                    saveEditTask(task.id);
                  } else {
                    setEditTaskData((prev) => ({
                      ...prev!,
                      priority: p,
                    }));
                  }
                }}
              >
                <span className="flex items-center gap-1">
                  {priorityColors[p as keyof typeof priorityColors].icon}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </span>
              </Badge>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const getDueDateInfo = (dateStr: string | null) => {
    if (!dateStr)
      return {
        text: "No due date",
        color: "text-gray-500",
        icon: <Calendar className="h-4 w-4 text-gray-400" />,
        bgColor: "",
      };

    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = isBefore(date, now) && !isToday(date);
    const isDueToday = isToday(date);

    if (isOverdue) {
      return {
        text: `Overdue: ${format(date, "PPP")}`,
        color: "text-red-600",
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        bgColor: "bg-red-50",
      };
    }

    if (isDueToday) {
      return {
        text: `Due today`,
        color: "text-orange-600",
        icon: <Clock className="h-4 w-4 text-orange-600" />,
        bgColor: "bg-orange-50",
      };
    }

    return {
      text: `Due: ${format(date, "PPP")}`,
      color: "text-blue-600",
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      bgColor: "bg-blue-50",
    };
  };

  const dueDateInfo = getDueDateInfo(task.due_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <TooltipProvider>
        <Card
          className={cn(
            "overflow-hidden transition-all duration-200 hover:shadow-md",
            "border-l-4",
            task.task_status === "completed"
              ? "border-l-green-500 bg-green-50/30"
              : task.priority === "high"
              ? "border-l-red-500"
              : task.priority === "medium"
              ? "border-l-orange-500"
              : "border-l-blue-300",
            task.task_status === "completed" && "opacity-80",
            isEditing &&
              "ring-2 ring-blue-200 border-blue-300 border-l-blue-500",
            isNewTask && "ring-2 ring-blue-300 border-blue-200 shadow-md"
          )}
        >
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              {/* Header Section with Title and Actions */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    className={cn(
                      "h-5 w-5 rounded-full transition-colors",
                      task.task_status === "completed"
                        ? "bg-green-100 text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                        : "bg-white data-[state=checked]:bg-blue-600"
                    )}
                    checked={task.task_status === "completed"}
                    onCheckedChange={() =>
                      toggleTaskStatus(task.id, task.task_status)
                    }
                    disabled={updatingTaskId === task.id || isNewTask}
                  />

                  <div onDoubleClick={handleEditTitle} className="flex-1">
                    {isEditingTitle ? (
                      <Input
                        ref={titleInputRef}
                        value={editTaskData?.title || ""}
                        onChange={(e) =>
                          setEditTaskData((prev) => ({
                            ...prev!,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Enter task title..."
                        className="border-gray-300 font-medium text-base focus:ring-blue-400"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveInlineEdit();
                            setIsEditingTitle(false);
                          }
                        }}
                      />
                    ) : (
                      <h3
                        className={cn(
                          "font-medium text-base transition-colors",
                          task.task_status === "completed"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        )}
                      >
                        {task.title}
                      </h3>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-gray-500 hover:text-gray-700 h-8 w-8 p-0",
                          isEditing && "text-blue-500 hover:text-blue-700"
                        )}
                        onClick={() => {
                          if (isEditing) {
                            handleSaveInlineEdit();
                            setIsEditingTitle(false);
                            setIsEditingDescription(false);
                          } else {
                            handleEditTitle();
                          }
                        }}
                      >
                        {isEditing ? (
                          <Save className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        {isEditing ? "Save changes" : "Edit task"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {isEditing ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Cancel</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Popover
                      open={isConfirmingDelete}
                      onOpenChange={setIsConfirmingDelete}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Delete task</p>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent className="w-auto p-3" align="end">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Delete this task?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTask(task.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsConfirmingDelete(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {/* Description Section - with tighter spacing */}
              <div className="pl-8">
                <div
                  onDoubleClick={handleEditDescription}
                  className="min-h-[1.5rem]"
                >
                  {isEditingDescription ? (
                    <Textarea
                      ref={descriptionInputRef}
                      value={editTaskData?.description || ""}
                      onChange={(e) =>
                        setEditTaskData((prev) => ({
                          ...prev!,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Add a description..."
                      className="border-gray-300 min-h-[60px] text-sm focus:ring-blue-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleSaveInlineEdit();
                          setIsEditingDescription(false);
                        }
                      }}
                    />
                  ) : task.description ? (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic cursor-pointer hover:text-gray-500 transition-colors">
                      Double-click to add description
                    </p>
                  )}
                </div>
              </div>

              {/* Footer with Badges, Due Date */}
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 pl-8 mt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(task.task_status)}
                  {getPriorityBadge(task.priority)}
                </div>

                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm cursor-pointer rounded-md px-2 py-1 transition-colors",
                        dueDateInfo.color,
                        dueDateInfo.bgColor &&
                          `${dueDateInfo.bgColor} bg-opacity-30 hover:bg-opacity-50`
                      )}
                    >
                      {dueDateInfo.icon}
                      <span>{dueDateInfo.text}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={
                        task.due_date ? new Date(task.due_date) : undefined
                      }
                      onSelect={(date) => {
                        setIsDatePickerOpen(false);

                        if (editTaskId !== task.id) {
                          setEditTaskId(task.id);
                          setEditTaskData({
                            title: task.title,
                            description: task.description || "",
                            priority: task.priority || "medium",
                            due_date: date ? date.toISOString() : null,
                          });
                          // Auto-save after selection
                          setTimeout(() => saveEditTask(task.id), 0);
                        } else {
                          setEditTaskData((prev) => ({
                            ...prev!,
                            due_date: date ? date.toISOString() : null,
                          }));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </motion.div>
  );
}
