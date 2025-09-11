"use client";
import { Label } from "@/components/ui/label";
import { CopyButton, ResetButton } from "./action-buttons";
import TextareaField from "./form-fields/textarea-field";

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
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <TextareaField readOnly value={value} textareaClassName="min-h-[350px] font-mono" />
      <div className="flex gap-2">
        <CopyButton disabled={!value} size="sm" getText={value} />
        <ResetButton size="sm" onClick={onClear} disabled={!value || disabled} label="Clear" />
      </div>
    </div>
  );
}
