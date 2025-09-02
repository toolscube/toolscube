import { Switch } from '@/components/ui/switch';

export default function SwitchRow({ label, checked, onChange, hint, disabled = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border py-2 px-3">
      <div className="mr-3">
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
