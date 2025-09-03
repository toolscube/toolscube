"use client";
import { GlassCard } from "@/components/ui/glass-card";

export function Display({ value, hint }: { value: string; hint?: string }) {
  return (
    <GlassCard className="col-span-4 flex flex-col items-end gap-1 rounded-2xl p-4">
      {hint ? (
        <div className="text-xs text-muted-foreground truncate w-full text-right">{hint}</div>
      ) : null}
      <div className="text-4xl font-semibold tracking-tight break-all text-right">
        {value || "0"}
      </div>
    </GlassCard>
  );
}
