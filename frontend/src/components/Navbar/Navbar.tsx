interface NavbarProps {
  onNewTask: () => void;
}

export function Navbar({ onNewTask }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-base-700 bg-base-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-teal/10">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path
                d="M7 20 L13 12 L18 17 L25 8"
                stroke="#2DD9C3"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="8" r="2.2" fill="#2DD9C3" />
            </svg>
          </div>
          <div>
            <h1 className="font-mono text-sm font-medium tracking-wide text-ink-100">OpsBoard</h1>
            <p className="text-xs text-ink-500">Cloud-native GitOps deployment platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-base-700 bg-base-900 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal-green" aria-hidden="true" />
            <span className="font-mono text-xs text-ink-300">API connected</span>
          </div>
          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex items-center gap-2 rounded-md bg-signal-teal px-3.5 py-2 text-sm font-medium text-base-950 transition hover:bg-signal-teal/90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            New task
          </button>
        </div>
      </div>
    </header>
  );
}
