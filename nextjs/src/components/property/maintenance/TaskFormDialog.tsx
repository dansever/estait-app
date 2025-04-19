import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceTaskCreate } from "@/lib/services/MaintenanceService";

interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  due_date: string;
}

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: MaintenanceTaskCreate) => Promise<void>;
  propertyId: string;
  initialData?: TaskFormData;
  isEdit?: boolean;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  onSubmit,
  propertyId,
  initialData,
  isEdit = false,
}: TaskFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(
    initialData || {
      title: "",
      description: "",
      priority: "",
      due_date: "",
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const taskData: MaintenanceTaskCreate = {
        title: formData.title,
        description: formData.description,
        property_id: propertyId,
        task_status: "open",
        priority: formData.priority || null,
        due_date: formData.due_date || null,
      };

      await onSubmit(taskData);

      // Reset form on success
      if (!isEdit) {
        setFormData({
          title: "",
          description: "",
          priority: "",
          due_date: "",
        });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple validation for required fields
  const isValid =
    formData.title.trim() !== "" && formData.description.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
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
              value={formData.description}
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
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">
                Due Date
              </label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Task"
              : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
