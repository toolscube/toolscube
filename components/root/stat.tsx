export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
