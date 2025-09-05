import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface SwitchRowProps {
  icon?: LucideIcon;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export default function SwitchRow({
  icon: Icon,
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
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          <p className="text-sm font-medium leading-none">{label}</p>
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
