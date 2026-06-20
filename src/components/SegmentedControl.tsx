interface Segment {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ segments, value, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex bg-[var(--bg-tertiary)] rounded-lg p-0.5 gap-0.5">
      {segments.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className={`px-3.5 py-1.5 rounded-[7px] text-[12px] font-medium transition-none ${
            value === seg.value
              ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
