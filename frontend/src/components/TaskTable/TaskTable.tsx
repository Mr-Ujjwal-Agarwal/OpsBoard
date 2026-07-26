import type { Task } from "../../types/task";
import { formatDate, truncate } from "../../utils/format";
import { PriorityBadge } from "../PriorityBadge/PriorityBadge";
import { StatusBadge } from "../StatusBadge/StatusBadge";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({ tasks, onEdit, onComplete, onDelete }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-base-700 bg-base-900 shadow-panel">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-base-700 text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3 font-medium">Task</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-base-800 last:border-b-0 hover:bg-base-800/50"
            >
              <td className="px-4 py-3 align-top">
                <p className="font-medium text-ink-100">{task.title}</p>
                {task.description && (
                  <p className="mt-0.5 text-xs text-ink-500">{truncate(task.description, 80)}</p>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3 align-top">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-4 py-3 align-top font-mono text-xs text-ink-500">
                {formatDate(task.created_at)}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex justify-end gap-3 text-xs">
                  {task.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => onComplete(task)}
                      className="font-medium text-signal-green hover:underline"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="font-medium text-ink-300 hover:text-ink-100 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="font-medium text-signal-red hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
