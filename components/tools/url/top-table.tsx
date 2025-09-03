"use client";

export default function TopTable({
  rows,
  labelClassName = "",
}: {
  rows: { label: string; value: number }[];
  labelClassName?: string;
}) {
  const total = rows.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = (r.value / total) * 100;
        return (
          <div key={r.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={`text-foreground/90 ${labelClassName}`} title={r.label}>
                {r.label}
              </span>
              <span className="tabular-nums text-muted-foreground">{r.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground/60" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
