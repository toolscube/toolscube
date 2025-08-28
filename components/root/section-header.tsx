export default function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6 space-y-2">
      <h1 className="relative inline-block text-3xl font-bold tracking-tight md:text-4xl">
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{title}</span>
      </h1>
      {desc ? <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">{desc}</p> : null}
    </div>
  );
}
