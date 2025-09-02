import { Switch } from '@/components/ui/switch';

export default function SwitchRow({ label, checked, onChange, hint, disabled = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2">
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
