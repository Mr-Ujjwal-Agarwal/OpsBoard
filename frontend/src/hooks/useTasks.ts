import { useCallback, useEffect, useState } from "react";

import { useDebouncedValue } from "./useDebouncedValue";
import { taskApi } from "../services/taskApi";
import type {
  Task,
  TaskCreateInput,
  TaskPriority,
  TaskStatistics,
  TaskStatus,
  TaskUpdateInput,
} from "../types/task";

interface UseTasksResult {
  tasks: Task[];
  statistics: TaskStatistics | null;
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: TaskStatus | "all";
  setStatusFilter: (value: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  setPriorityFilter: (value: TaskPriority | "all") => void;
  refresh: () => Promise<void>;
  createTask: (payload: TaskCreateInput) => Promise<void>;
  updateTask: (id: number, payload: TaskUpdateInput) => Promise<void>;
  markComplete: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

/**
 * Owns all task list state: fetching, filters, and mutations. Components
 * consume this hook rather than calling taskApi directly, keeping data
 * fetching concerns out of presentational components.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResponse, statsResponse] = await Promise.all([
        taskApi.list({
          search: debouncedSearch || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          priority: priorityFilter === "all" ? undefined : priorityFilter,
        }),
        taskApi.getStatistics(),
      ]);
      setTasks(listResponse.items);
      setStatistics(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTask = useCallback(
    async (payload: TaskCreateInput) => {
      await taskApi.create(payload);
      await fetchData();
    },
    [fetchData]
  );

  const updateTask = useCallback(
    async (id: number, payload: TaskUpdateInput) => {
      await taskApi.update(id, payload);
      await fetchData();
    },
    [fetchData]
  );

  const markComplete = useCallback(
    async (id: number) => {
      await taskApi.markComplete(id);
      await fetchData();
    },
    [fetchData]
  );

  const deleteTask = useCallback(
    async (id: number) => {
      await taskApi.remove(id);
      await fetchData();
    },
    [fetchData]
  );

  return {
    tasks,
    statistics,
    isLoading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    refresh: fetchData,
    createTask,
    updateTask,
    markComplete,
    deleteTask,
  };
}
