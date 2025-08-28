// app/calc/bmi/page.tsx
'use client';
import SectionHeader from '@/components/root/section-header';
import Stat from '@/components/root/stat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';

export default function BMIPage() {
  const [heightValue, setHeightValue] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const parsed = useMemo(() => {
    const h = parseFloat(heightValue);
    const w = parseFloat(weightValue);
    if (!h || !w || h <= 0 || w <= 0) return null;

    const meters = heightUnit === 'cm' ? h / 100 : h * 0.0254;
    const kg = weightUnit === 'kg' ? w : w * 0.45359237;
    const bmi = kg / (meters * meters);

    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Healthy';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    const minKg = 18.5 * meters * meters;
    const maxKg = 24.9 * meters * meters;

    return { bmi, category, minKg, maxKg, meters };
  }, [heightValue, heightUnit, weightValue, weightUnit]);

  const pretty = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '-');

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="BMI Calculator" desc="Calculate your Body Mass Index with metric or imperial units. Dark‑mode friendly UI with ShadCN components." />

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80 border-muted/40">
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Enter your height and weight, then see your BMI and healthy weight range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-3">
              <Label className="text-sm">Height</Label>
              <div className="flex items-center gap-2">
                <Input inputMode="decimal" placeholder="e.g., 170" value={heightValue} onChange={(e) => setHeightValue(e.target.value)} />
                <Select value={heightUnit} onValueChange={(v) => setHeightUnit(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="in">inch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label className="text-sm">Weight</Label>
              <div className="flex items-center gap-2">
                <Input inputMode="decimal" placeholder="e.g., 65" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} />
                <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="BMI" value={parsed ? pretty(parsed.bmi, 1) : '—'} />
            <Stat label="Category" value={parsed ? parsed.category : '—'} />
            <Stat label="Healthy Range" value={parsed ? `${pretty(parsed.minKg, 1)}–${pretty(parsed.maxKg, 1)} kg` : '—'} />
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <p>* Categories based on WHO: Underweight (&lt;18.5), Healthy (18.5–24.9), Overweight (25–29.9), Obese (≥30).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
