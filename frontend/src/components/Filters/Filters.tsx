import type { TaskPriority, TaskStatus } from "../../types/task";
import { PRIORITY_LABELS, STATUS_LABELS } from "../../types/task";

interface FiltersProps {
  statusFilter: TaskStatus | "all";
  onStatusChange: (value: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  onPriorityChange: (value: TaskPriority | "all") => void;
}

const selectClasses =
  "rounded-md border border-base-700 bg-base-900 px-3 py-2 text-sm text-ink-100 focus:border-signal-teal/50";

export function Filters({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: FiltersProps) {
  return (
    <div className="flex gap-3">
      <select
        aria-label="Filter by status"
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value as TaskStatus | "all")}
        className={selectClasses}
      >
        <option value="all">All statuses</option>
        {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by priority"
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value as TaskPriority | "all")}
        className={selectClasses}
      >
        <option value="all">All priorities</option>
        {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
