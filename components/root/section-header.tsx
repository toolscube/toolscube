export default function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {desc ? <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{desc}</p> : null}
    </div>
  );
}
