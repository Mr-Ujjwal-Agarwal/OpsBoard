import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Task, TaskCreateInput, TaskPriority, TaskStatus } from "../../types/task";
import { PRIORITY_LABELS, STATUS_LABELS } from "../../types/task";

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (payload: TaskCreateInput) => Promise<void>;
}

const EMPTY_FORM: TaskCreateInput = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
};

export function TaskModal({ isOpen, task, onClose, onSubmit }: TaskModalProps) {
  const [form, setForm] = useState<TaskCreateInput>(EMPTY_FORM);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            priority: task.priority,
          }
        : EMPTY_FORM
    );
    setTitleError(null);
    setSubmitError(null);
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ ...form, title: trimmedTitle, description: form.description?.trim() || null });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-base-700 bg-base-900 p-6 shadow-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="task-modal-title" className="text-base font-medium text-ink-100">
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink-500 hover:text-ink-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-xs font-medium text-ink-500">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(event) => {
                setForm({ ...form, title: event.target.value });
                if (titleError) setTitleError(null);
              }}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-sm text-ink-100 focus:border-signal-teal/50"
              placeholder="e.g. Configure Prometheus scrape targets"
            />
            {titleError && <p className="mt-1 text-xs text-signal-red">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-xs font-medium text-ink-500">
              Description
            </label>
            <textarea
              id="description"
              value={form.description ?? ""}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              className="w-full resize-none rounded-md border border-base-700 bg-base-950 px-3 py-2 text-sm text-ink-100 focus:border-signal-teal/50"
              placeholder="Optional details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="mb-1 block text-xs font-medium text-ink-500">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}
                className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-sm text-ink-100 focus:border-signal-teal/50"
              >
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="mb-1 block text-xs font-medium text-ink-500">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}
                className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-sm text-ink-100 focus:border-signal-teal/50"
              >
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {submitError && (
            <p className="rounded-md border border-signal-red/30 bg-signal-red/5 px-3 py-2 text-xs text-signal-red">
              {submitError}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-base-600 px-3.5 py-2 text-sm font-medium text-ink-300 transition hover:border-base-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-signal-teal px-3.5 py-2 text-sm font-medium text-base-950 transition hover:bg-signal-teal/90 disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
