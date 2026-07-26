import type { TaskStatus } from "../../types/task";
import { STATUS_LABELS } from "../../types/task";

const STYLES: Record<TaskStatus, string> = {
  pending: "bg-signal-amber/10 text-signal-amber border-signal-amber/30",
  in_progress: "bg-signal-blue/10 text-signal-blue border-signal-blue/30",
  completed: "bg-signal-green/10 text-signal-green border-signal-green/30",
};

const DOT_STYLES: Record<TaskStatus, string> = {
  pending: "bg-signal-amber",
  in_progress: "bg-signal-blue",
  completed: "bg-signal-green",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
