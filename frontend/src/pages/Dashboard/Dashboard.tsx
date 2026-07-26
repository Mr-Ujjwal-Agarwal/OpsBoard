import { useState } from "react";

import { Filters } from "../../components/Filters/Filters";
import { Navbar } from "../../components/Navbar/Navbar";
import { SearchBar } from "../../components/SearchBar/SearchBar";
import { StatCards } from "../../components/StatCards/StatCards";
import { TaskModal } from "../../components/TaskModal/TaskModal";
import { TaskTable } from "../../components/TaskTable/TaskTable";
import { EmptyState } from "../../components/states/EmptyState";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";
import { useTasks } from "../../hooks/useTasks";
import type { Task, TaskCreateInput } from "../../types/task";

export function Dashboard() {
  const {
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
    refresh,
    createTask,
    updateTask,
    markComplete,
    deleteTask,
  } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const hasActiveFilters = Boolean(search) || statusFilter !== "all" || priorityFilter !== "all";

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (payload: TaskCreateInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await createTask(payload);
    }
  };

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteTask(task.id);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="min-h-screen">
      <Navbar onNewTask={openCreateModal} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <StatCards statistics={statistics} />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} />
          <Filters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </div>

        <div className="mt-6">
          {isLoading && tasks.length === 0 ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : tasks.length === 0 ? (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onNewTask={openCreateModal}
              onClearFilters={clearFilters}
            />
          ) : (
            <TaskTable
              tasks={tasks}
              onEdit={openEditModal}
              onComplete={(task) => markComplete(task.id)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <TaskModal isOpen={isModalOpen} task={editingTask} onClose={closeModal} onSubmit={handleSubmit} />
    </div>
  );
}
