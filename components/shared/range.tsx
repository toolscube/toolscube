import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export function Range({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value}%</span>
      </div>
      <Slider min={50} max={150} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
