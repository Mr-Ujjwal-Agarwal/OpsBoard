import type { TaskPriority } from "../../types/task";
import { PRIORITY_LABELS } from "../../types/task";

const STYLES: Record<TaskPriority, string> = {
  low: "text-ink-500 border-base-500",
  medium: "text-signal-amber border-signal-amber/40",
  high: "text-signal-red border-signal-red/40",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
