'use client';
import SectionHeader from '@/components/root/section-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';

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

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('Length');
  const [fromUnit, setFromUnit] = useState<string>(UNITS['Length'][0]);
  const [toUnit, setToUnit] = useState<string>(UNITS['Length'][1]);
  const [amount, setAmount] = useState<string>('1');

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num)) return null;
    const base = toBase(category, num, fromUnit);
    return fromBase(category, base, toUnit);
  }, [category, fromUnit, toUnit, amount]);

  // Ensure unit selections reset when category changes
  const handleCategory = (v: Category) => {
    setCategory(v);
    setFromUnit(UNITS[v][0]);
    setToUnit(UNITS[v][1] ?? UNITS[v][0]);
  };

  const pretty = (n: number | null) => (n == null ? '—' : new Intl.NumberFormat().format(n));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="Unit Converter" desc="Convert between common length, weight, and temperature units. Built with ShadCN UI." />

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80 border-muted/40">
        <CardHeader>
          <CardTitle>Conversion</CardTitle>
          <CardDescription>Select a category, units, and amount.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => handleCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>From</Label>
                <div className="flex items-center gap-2">
                  <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-36">
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
              </div>

              <div className="grid gap-2">
                <Label>To</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="w-36">
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
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Result</div>
                <div className="mt-2 text-3xl font-semibold">
                  {pretty(result)} {toUnit}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Base units: meters, kilograms, and Celsius.</p>
              </div>

              <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
                <p>Temperature uses exact conversion formulas. Length & weight use SI factors.</p>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-xs text-muted-foreground">Tip: Press Tab to quickly move between fields.</p>
        </CardContent>
      </Card>
    </div>
  );
}
