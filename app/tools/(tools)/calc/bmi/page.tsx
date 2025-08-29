'use client';

import SectionHeader from '@/components/root/section-header';
import Stat from '@/components/root/stat';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
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

  // convert healthy range to current weight unit for display
  const rangeText = useMemo(() => {
    if (!parsed) return '—';
    const { minKg, maxKg } = parsed;
    if (weightUnit === 'kg') return `${pretty(minKg, 1)} – ${pretty(maxKg, 1)} kg`;
    const minLb = minKg / 0.45359237;
    const maxLb = maxKg / 0.45359237;
    return `${pretty(minLb, 1)} – ${pretty(maxLb, 1)} lb`;
  }, [parsed, weightUnit]);

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

      {/* Glass Calculator Card */}
      <MotionGlassCard>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Enter your height and weight to calculate BMI and see your healthy range.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Height */}
            <GlassCard className="p-4 bg-card/60 backdrop-blur">
              <div className="grid gap-3">
                <Label className="text-sm">Height</Label>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder={heightUnit === 'cm' ? '170' : '67'}
                    value={heightValue}
                    onChange={(e) => setHeightValue(e.target.value)}
                    className="bg-background/60 backdrop-blur"
                  />
                  <Select value={heightUnit} onValueChange={(v) => setHeightUnit(v as any)}>
                    <SelectTrigger className="w-28 bg-background/60 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">CM</SelectItem>
                      <SelectItem value="in">INCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>

            {/* Weight */}
            <GlassCard className="p-4 bg-card/60 backdrop-blur">
              <div className="grid gap-3">
                <Label className="text-sm">Weight</Label>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder={weightUnit === 'kg' ? '65' : '143'}
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    className="bg-background/60 backdrop-blur"
                  />
                  <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as any)}>
                    <SelectTrigger className="w-28 bg-background/60 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>
          </div>

          <Separator className="my-6" />

          {/* Stats in glass tiles */}
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard className="p-4">
              <Stat label="BMI" value={parsed ? pretty(parsed.bmi, 1) : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Category" value={parsed ? parsed.category : '—'} />
            </GlassCard>
            <GlassCard className="p-4">
              <Stat label="Healthy Range" value={parsed ? rangeText : '—'} />
            </GlassCard>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">* Categories: Underweight (&lt;18.5), Healthy (18.5–24.9), Overweight (25–29.9), Obese (≥30).</div>
        </div>
      </MotionGlassCard>
    </div>
  );
}
