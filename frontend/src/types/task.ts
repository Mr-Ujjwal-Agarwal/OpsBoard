export type TaskStatus = "pending" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  total: number;
  items: Task[];
}

export interface TaskStatistics {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  low_priority: number;
  medium_priority: number;
  high_priority: number;
  completion_rate: number;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
}

export type TaskUpdateInput = Partial<TaskCreateInput>;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
