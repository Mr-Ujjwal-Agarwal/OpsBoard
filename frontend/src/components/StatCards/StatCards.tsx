import type { TaskStatistics } from "../../types/task";

interface StatCardsProps {
  statistics: TaskStatistics | null;
}

interface CardDef {
  label: string;
  value: string;
  accent: string;
}

export function StatCards({ statistics }: StatCardsProps) {
  const cards: CardDef[] = [
    {
      label: "Total tasks",
      value: statistics ? String(statistics.total) : "—",
      accent: "bg-signal-teal",
    },
    {
      label: "In progress",
      value: statistics ? String(statistics.in_progress) : "—",
      accent: "bg-signal-blue",
    },
    {
      label: "Completed",
      value: statistics ? String(statistics.completed) : "—",
      accent: "bg-signal-green",
    },
    {
      label: "Completion rate",
      value: statistics ? `${statistics.completion_rate}%` : "—",
      accent: "bg-signal-amber",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-lg border border-base-700 bg-base-900 p-4 shadow-panel"
        >
          <span className={`absolute inset-x-0 top-0 h-0.5 ${card.accent}`} aria-hidden="true" />
          <p className="text-xs uppercase tracking-wide text-ink-500">{card.label}</p>
          <p className="mt-2 font-mono text-2xl font-medium text-ink-100">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
