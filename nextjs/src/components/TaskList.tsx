"use client";

import React from "react";
import { Database } from "@/lib/types";
import TaskItem from "./TaskItem";

type Task = Database["public"]["Tables"]["todo_list"]["Row"];

interface TaskListProps {
  tasks: Task[];
  onMarkDone: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  filter?: boolean | null;
}

export default function TaskList({ 
  tasks, 
  onMarkDone, 
  onRemove, 
  filter = null 
}: TaskListProps) {
  // Filter tasks based on the filter prop
  const filteredTasks = filter !== null 
    ? tasks.filter(task => task.done === filter) 
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No tasks found
      </div>
    );
  }

  return (
    <div className="space-y-3 relative">
      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onMarkDone={onMarkDone}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}