import { apiClient } from "./apiClient";
import type {
  Task,
  TaskCreateInput,
  TaskListResponse,
  TaskPriority,
  TaskStatistics,
  TaskStatus,
  TaskUpdateInput,
} from "../types/task";

export interface TaskQueryParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

function buildParams(params: TaskQueryParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.status) query.status = params.status;
  if (params.priority) query.priority = params.priority;
  return query;
}

export const taskApi = {
  async list(params: TaskQueryParams = {}): Promise<TaskListResponse> {
    const response = await apiClient.get<TaskListResponse>("/tasks", {
      params: buildParams(params),
    });
    return response.data;
  },

  async getStatistics(): Promise<TaskStatistics> {
    const response = await apiClient.get<TaskStatistics>("/tasks/statistics");
    return response.data;
  },

  async create(payload: TaskCreateInput): Promise<Task> {
    const response = await apiClient.post<Task>("/tasks", payload);
    return response.data;
  },

  async update(id: number, payload: TaskUpdateInput): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, payload);
    return response.data;
  },

  async markComplete(id: number): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
