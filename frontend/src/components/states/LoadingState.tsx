export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-500">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-base-600 border-t-signal-teal"
        role="status"
        aria-label="Loading tasks"
      />
      <p className="font-mono text-xs">Loading tasks…</p>
    </div>
  );
}
