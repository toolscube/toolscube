"use client";
import { Check, Copy } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function useCopyToast(ms = 1100) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), ms);
    },
    [ms],
  );
  return { copied, copy };
}

export function ProcessLog({
  value,
  onClear,
  label = "Process Log",
  disabled,
}: {
  value: string;
  onClear: () => void;
  label?: string;
  disabled?: boolean;
}) {
  const { copied, copy } = useCopyToast();
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Textarea readOnly value={value} className="min-h-[120px] font-mono" />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => copy(value)}
          disabled={!value || disabled}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onClear}
          disabled={!value || disabled}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
