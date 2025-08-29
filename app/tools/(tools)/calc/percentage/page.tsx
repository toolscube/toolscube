'use client';

import { CalcButton } from '@/components/calculators/calc-button';
import SectionHeader from '@/components/root/section-header';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator, FunctionSquare, Percent } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function PercentageCalculatorPage() {
  const [part, setPart] = useState('');
  const [whole, setWhole] = useState('');
  const [percent, setPercent] = useState('');
  const [base, setBase] = useState('');
  const [changePct, setChangePct] = useState('');

  const result = useMemo(() => {
    const p = parseFloat(part);
    const w = parseFloat(whole);
    const r = parseFloat(percent);
    return {
      percent: Number.isFinite(p) && Number.isFinite(w) && w !== 0 ? (p / w) * 100 : null,
      of: Number.isFinite(w) && Number.isFinite(r) ? (w * r) / 100 : null,
    };
  }, [part, whole, percent]);

  const change = useMemo(() => {
    const b = parseFloat(base);
    const c = parseFloat(changePct);
    if (!Number.isFinite(b) || !Number.isFinite(c)) return { inc: null as number | null, dec: null as number | null };
    return { inc: b * (1 + c / 100), dec: b * (1 - c / 100) };
  }, [base, changePct]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="Percentage Calculator" desc="Find percentages fast: X is what % of Y, what is R% of Y, and increase/decrease by %." />

      {/* Quick nav */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/tools/calc/standard">
          <CalcButton variantIntent="ghost" className="px-3">
            <Calculator className="mr-2 h-4 w-4" />
            Standard
          </CalcButton>
        </Link>
        <Link href="/tools/calc/scientific">
          <CalcButton variantIntent="ghost" className="px-3">
            <FunctionSquare className="mr-2 h-4 w-4" />
            Scientific
          </CalcButton>
        </Link>
        <Link href="/tools/calc/percentage">
          <CalcButton variantIntent="primary" className="px-3">
            <Percent className="mr-2 h-4 w-4" />
            Percentage
          </CalcButton>
        </Link>
      </div>

      <MotionGlassCard className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* X is what % of Y */}
          <GlassCard className="p-4">
            <div className="grid gap-2">
              <Label>X is what % of Y?</Label>
              <div className="flex gap-2">
                <Input inputMode="decimal" placeholder="X" value={part} onChange={(e) => setPart(e.target.value)} className="bg-background/60 backdrop-blur" />
                <Input inputMode="decimal" placeholder="Y" value={whole} onChange={(e) => setWhole(e.target.value)} className="bg-background/60 backdrop-blur" />
              </div>
              <div className="text-sm text-muted-foreground">Result: {Number.isFinite(result.percent as number) ? `${(result.percent as number).toFixed(2)}%` : '—'}</div>
            </div>
          </GlassCard>

          {/* What is R% of Y */}
          <GlassCard className="p-4">
            <div className="grid gap-2">
              <Label>What is R% of Y?</Label>
              <div className="flex gap-2">
                <Input inputMode="decimal" placeholder="R%" value={percent} onChange={(e) => setPercent(e.target.value)} className="bg-background/60 backdrop-blur" />
                <Input inputMode="decimal" placeholder="Y" value={whole} onChange={(e) => setWhole(e.target.value)} className="bg-background/60 backdrop-blur" />
              </div>
              <div className="text-sm text-muted-foreground">Result: {Number.isFinite(result.of as number) ? (result.of as number).toFixed(2) : '—'}</div>
            </div>
          </GlassCard>
        </div>

        <Separator />

        {/* Increase / Decrease by % */}
        <GlassCard className="p-4">
          <div className="grid gap-2">
            <Label>Increase / Decrease by %</Label>
            <div className="flex gap-2">
              <Input inputMode="decimal" placeholder="Base" value={base} onChange={(e) => setBase(e.target.value)} className="bg-background/60 backdrop-blur" />
              <Input inputMode="decimal" placeholder="%" value={changePct} onChange={(e) => setChangePct(e.target.value)} className="bg-background/60 backdrop-blur" />
            </div>
            <div className="text-sm text-muted-foreground">
              Increase: {Number.isFinite(change.inc as number) ? (change.inc as number).toFixed(2) : '—'}
              <span className="mx-2">•</span>
              Decrease: {Number.isFinite(change.dec as number) ? (change.dec as number).toFixed(2) : '—'}
            </div>
          </div>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
