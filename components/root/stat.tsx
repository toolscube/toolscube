export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card/80 p-4 shadow-sm transition hover:shadow-md hover:border-primary/40">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
