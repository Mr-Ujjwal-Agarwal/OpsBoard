interface EmptyStateProps {
  hasActiveFilters: boolean;
  onNewTask: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ hasActiveFilters, onNewTask, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-base-700 py-20 text-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-700">
        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {hasActiveFilters ? (
        <>
          <p className="text-sm text-ink-300">No tasks match your search or filters.</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-medium text-signal-teal hover:underline"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-ink-300">No tasks yet.</p>
          <button
            type="button"
            onClick={onNewTask}
            className="rounded-md bg-signal-teal px-3.5 py-2 text-sm font-medium text-base-950 transition hover:bg-signal-teal/90"
          >
            Create your first task
          </button>
        </>
      )}
    </div>
  );
}
