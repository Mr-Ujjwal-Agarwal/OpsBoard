interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-signal-red/30 bg-signal-red/5 py-16 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal-red">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-ink-100">Couldn't load tasks</p>
      <p className="max-w-sm font-mono text-xs text-ink-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-base-600 px-3.5 py-2 text-sm font-medium text-ink-100 transition hover:border-signal-teal/50"
      >
        Try again
      </button>
    </div>
  );
}
