'use client';

import SectionHeader from '@/components/root/section-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, Copy, Info, Ruler, Scale, Sparkles, ThermometerSun } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Length', 'Weight', 'Temperature'] as const;
type Category = (typeof CATEGORIES)[number];

const UNITS: Record<Category, string[]> = {
  Length: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
  Weight: ['kg', 'g', 'lb', 'oz'],
  Temperature: ['C', 'F', 'K'],
};

function toBase(category: Category, value: number, unit: string): number {
  switch (category) {
    case 'Length': {
      const map: Record<string, number> = {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.344,
        yd: 0.9144,
        ft: 0.3048,
        in: 0.0254,
      };
      return value * map[unit]; // base: meter
    }
    case 'Weight': {
      const map: Record<string, number> = {
        kg: 1,
        g: 0.001,
        lb: 0.45359237,
        oz: 0.028349523125,
      };
      return value * map[unit]; // base: kilogram
    }
    case 'Temperature': {
      // base: Celsius
      if (unit === 'C') return value;
      if (unit === 'F') return (value - 32) * (5 / 9);
      if (unit === 'K') return value - 273.15;
      return value;
    }
  }
}

function fromBase(category: Category, baseValue: number, unit: string): number {
  switch (category) {
    case 'Length': {
      const map: Record<string, number> = {
        m: 1,
        km: 1 / 1000,
        cm: 100,
        mm: 1000,
        mi: 1 / 1609.344,
        yd: 1 / 0.9144,
        ft: 1 / 0.3048,
        in: 1 / 0.0254,
      };
      return baseValue * map[unit];
    }
    case 'Weight': {
      const map: Record<string, number> = {
        kg: 1,
        g: 1000,
        lb: 1 / 0.45359237,
        oz: 1 / 0.028349523125,
      };
      return baseValue * map[unit];
    }
    case 'Temperature': {
      if (unit === 'C') return baseValue;
      if (unit === 'F') return baseValue * (9 / 5) + 32;
      if (unit === 'K') return baseValue + 273.15;
      return baseValue;
    }
  }
}

const ICON_BY_CATEGORY = {
  Length: <Ruler className="h-4 w-4" />,
  Weight: <Scale className="h-4 w-4" />,
  Temperature: <ThermometerSun className="h-4 w-4" />,
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('Length');
  const [fromUnit, setFromUnit] = useState<string>(UNITS['Length'][0]);
  const [toUnit, setToUnit] = useState<string>(UNITS['Length'][1]);
  const [amount, setAmount] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num)) return null;
    const base = toBase(category, num, fromUnit);
    return fromBase(category, base, toUnit);
  }, [category, fromUnit, toUnit, amount]);

  const handleCategory = (v: Category) => {
    setCategory(v);
    setFromUnit(UNITS[v][0]);
    setToUnit(UNITS[v][1] ?? UNITS[v][0]);
  };

  const swapUnits = () => {
    setFromUnit((prev) => {
      const f = toUnit;
      setToUnit(prev);
      return f;
    });
  };

  const pretty = (n: number | null) => (n == null ? '—' : new Intl.NumberFormat().format(n));

  const copyResult = async () => {
    try {
      if (result == null) return;
      await navigator.clipboard.writeText(`${pretty(result)} ${toUnit}`);
      setCopied(true);
      toast.success('Copied Successfully!');
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="container mx-auto py-10">
      <SectionHeader title="Unit Converter" desc="Convert between length, weight, and temperature with a gorgeous glass UI." />

      <MotionGlassCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Conversion
            </CardTitle>
            <Badge variant="secondary" className="ml-1">
              {ICON_BY_CATEGORY[category as keyof typeof ICON_BY_CATEGORY]}
              <span className="ml-1 hidden sm:inline">{category}</span>
            </Badge>
          </div>
          <CardDescription>Select a category, units, and amount.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Controls */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => handleCategory(v as Category)}>
                  <SelectTrigger className="bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        <div className="flex items-center gap-2">
                          {ICON_BY_CATEGORY[c as keyof typeof ICON_BY_CATEGORY]}
                          <span>{c}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>From</Label>
                <div className="flex items-center gap-2">
                  <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-background/60 backdrop-blur" />
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS[category].map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={swapUnits} className="shrink-0">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>To</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS[category].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {['1', '10', '100', '1000'].map((p) => (
                  <Badge key={p} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setAmount(p)}>
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Result / Info */}
            <div className="grid gap-4">
              {/* Result box as a GlassCard */}
              <GlassCard className="rounded-2xl p-6">
                <div className="text-sm text-muted-foreground">Result</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="text-4xl font-semibold tracking-tight">
                    {pretty(result)} {toUnit}
                  </div>
                  <Button variant="ghost" size="icon" onClick={copyResult} title="Copy" className="hover:bg-primary/10">
                    <Copy className={`h-4 w-4 ${copied ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Base units: meters, kilograms, and Celsius.</p>
              </GlassCard>

              {/* Info box as a GlassCard */}
              <GlassCard className="rounded-2xl p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Info className="h-3.5 w-3.5" /> Notes
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Temperature uses exact conversion formulas.</li>
                  <li>Length &amp; weight use SI factors.</li>
                  <li className="flex items-center gap-1 flex-wrap">
                    Use the
                    <span>
                      <ArrowLeftRight className="h-4 w-4" />
                    </span>
                    button to quickly swap units.
                  </li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </div>
      </MotionGlassCard>
    </div>
  );
}
