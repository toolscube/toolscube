import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface SwitchRowProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export default function SwitchRow({
  label,
  checked,
  onCheckedChange,
  hint,
  disabled = false,
  className,
}: SwitchRowProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg border py-2 px-3", className)}>
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
