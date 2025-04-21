"use client";

import { EnrichedProperty } from "@/lib/enrichedPropertyType";

export default function Maintenance({ data }: { data: EnrichedProperty }) {
  const { rawTasks } = data;

  if (!rawTasks?.length) return <p>No maintenance tasks found.</p>;

  return (
    <ul className="space-y-2 text-sm">
      {rawTasks.map((task) => (
        <li key={task.id} className="border-b pb-2">
          <p>
            <strong>{task.title}</strong> ({task.task_status})
          </p>
          <p className="text-xs text-gray-500">
            Due: {task.due_date || "—"} | Priority: {task.priority}
          </p>
        </li>
      ))}
    </ul>
  );
}
