"use client";

import React, { useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { Database } from "@/lib/types";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, AlertCircle } from "lucide-react";

type NewTask = Database["public"]["Tables"]["todo_list"]["Insert"];

interface CreateTaskDialogProps {
  onTaskCreated: () => Promise<void>;
}

export default function CreateTaskDialog({
  onTaskCreated,
}: CreateTaskDialogProps) {
  const { user } = useGlobal();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user?.id) return;

    try {
      setLoading(true);
      const supabase = await createSPASassClient();
      const newTask: NewTask = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        urgent: isUrgent,
        owner: user.id,
        done: false,
      };

      const { error: supabaseError } = await supabase.createTask(newTask);
      if (supabaseError) throw supabaseError;

      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsUrgent(false);
      setOpen(false);
      await onTaskCreated();
    } catch (err) {
      setError("Failed to add task");
      console.error("Error adding task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-600 text-white hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm">Mark as urgent</span>
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white hover:bg-primary-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
