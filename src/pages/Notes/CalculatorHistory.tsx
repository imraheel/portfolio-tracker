import { Trash2 } from 'lucide-react';

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalculatorHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export default function CalculatorHistory({ history, onClear }: CalculatorHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-[var(--text-muted)]">No calculations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
        <span className="text-[11px] font-medium text-[var(--text-secondary)]">History</span>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="px-2 py-1.5 rounded bg-[var(--bg-tertiary)] text-right"
          >
            <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
              {entry.expression}
            </div>
            <div className="text-xs font-semibold text-[var(--text-primary)] font-mono">
              = {entry.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
