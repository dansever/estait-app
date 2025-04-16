"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2 } from "lucide-react";
import { Database } from "@/lib/types";

type Task = Database["public"]["Tables"]["todo_list"]["Row"];

interface TaskItemProps {
  task: Task;
  onMarkDone: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

export default function TaskItem({ task, onMarkDone, onRemove }: TaskItemProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        task.done ? "bg-muted" : "bg-card"
      } ${task.urgent && !task.done ? "border-red-200" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium ${
              task.done ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Created: {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.urgent && !task.done && (
              <span className="px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full">
                Urgent
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!task.done && (
            <Button
              onClick={() => onMarkDone(task.id)}
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-5 w-5" />
            </Button>
          )}
          <Button
            onClick={() => onRemove(task.id)}
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}