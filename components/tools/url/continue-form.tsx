"use client";

import * as React from "react";
import { ActionButton } from "@/components/shared/action-buttons";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";

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
          <Label className="inline-flex items-center gap-2 text-xs" htmlFor="agree">
            <Checkbox id="agree" checked={agree} onCheckedChange={() => setAgree(!agree)} />
            <span>I trust this site</span>
          </Label>
          <ActionButton variant="default" type="submit" disabled={!canSubmit} label="Continue" />
        </div>
      </form>
    </GlassCard>
  );
}
