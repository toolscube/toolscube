import { Switch } from '@/components/ui/switch';

interface Type {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export default function SwitchRow({ label, checked, onCheckedChange, hint, disabled = false }: Type) {
  return (
    <div className="flex items-center justify-between rounded-lg border py-2 px-3">
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
