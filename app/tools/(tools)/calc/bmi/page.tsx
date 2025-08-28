'use client';
import SectionHeader from '@/components/root/section-header';
import Stat from '@/components/root/stat';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';

export default function BMIPage() {
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightValue, setWeightValue] = useState('');
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

    return { bmi, category, minKg, maxKg };
  }, [heightValue, heightUnit, weightValue, weightUnit]);

  const pretty = (n: number, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '—');

  return (
    <div className="py-10 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tools">Tools</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tools/calc">Calculators</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>BMI Calculator</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <SectionHeader title="BMI Calculator" desc="Calculate your Body Mass Index with metric or imperial units." />

      {/* Calculator Card */}
      <Card className="relative overflow-hidden rounded-2xl border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div aria-hidden className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Enter your height and weight to calculate BMI and see your healthy range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Height */}
            <div className="grid gap-3">
              <Label className="text-sm">Height</Label>
              <div className="flex items-center gap-2">
                <Input inputMode="decimal" placeholder="170" value={heightValue} onChange={(e) => setHeightValue(e.target.value)} />

                <Select value={heightUnit} onValueChange={(v) => setHeightUnit(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">CM</SelectItem>
                    <SelectItem value="in">INCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weight */}
            <div className="grid gap-3">
              <Label className="text-sm">Weight</Label>
              <div className="flex items-center gap-2">
                <Input inputMode="decimal" placeholder="65" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} />
                <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">KG</SelectItem>
                    <SelectItem value="lb">LB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="BMI" value={parsed ? pretty(parsed.bmi, 1) : '—'} />
            <Stat label="Category" value={parsed ? parsed.category : '—'} />
            <Stat label="Healthy Range" value={parsed ? `${pretty(parsed.minKg, 1)} – ${pretty(parsed.maxKg, 1)} kg` : '—'} />
          </div>

          <div className="mt-6 text-xs text-muted-foreground">* Categories: Underweight (&lt;18.5), Healthy (18.5–24.9), Overweight (25–29.9), Obese (≥30).</div>
        </CardContent>
      </Card>
    </div>
  );
}
