"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function ContinueForm({
  action,
  host,
}: {
  action: (formData: FormData) => Promise<void>;
  host: string;
}) {
  const [agree, setAgree] = React.useState(false);
  const [left, setLeft] = React.useState(3);
  const canSubmit = agree && left === 0;

  React.useEffect(() => {
    if (left === 0) return;
    const t = setTimeout(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <GlassCard className="p-4">
      <form
        action={action}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-sm text-muted-foreground">
          You’re about to continue to <span className="font-medium text-foreground">{host}</span>.
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I trust this site
          </label>

          <Button type="submit" disabled={!canSubmit} className="gap-2">
            Continue {left > 0 && `(${left})`}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
