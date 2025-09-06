import { HeartPulse, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stat({
  label,
  value,
  hint,
  Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  Icon?: LucideIcon;
  className?: string;
}) {
  const TopIcon = Icon ?? HeartPulse;

  return (
    <div className={cn("rounded-md border p-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <TopIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
