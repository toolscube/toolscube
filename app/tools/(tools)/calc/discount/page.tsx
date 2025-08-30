'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftRight, Calculator, Check, Copy, Download, RotateCcw, Tag } from 'lucide-react';

// ===== Types =====
type Currency = 'BDT' | 'USD' | 'INR';
type Mode = 'forward' | 'reverse'; // forward: compute final price from discount; reverse: compute needed discount from final price

// ===== Helpers =====
function parseNum(n: string | number): number {
  const v = typeof n === 'number' ? n : Number(String(n).replace(/,/g, '').trim());
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number, currency: Currency) {
  const code = currency;
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

function qs(k: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return new URLSearchParams(window.location.search).get(k) ?? fallback;
}
function setParams(params: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  window.history.replaceState({}, '', url.toString());
}

function csvDownload(filename: string, rows: (string | number)[][]) {
  const content = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ===== Page =====
export default function DiscountFinderPage() {
  // Query-backed defaults
  const [currency, setCurrency] = useState<Currency>((qs('c', 'BDT') as Currency) || 'BDT');
  const [mode, setMode] = useState<Mode>((qs('m', 'forward') as Mode) || 'forward');

  const [original, setOriginal] = useState<string>(qs('op', '1200') || '1200'); // Original price (single unit)
  const [discountPct, setDiscountPct] = useState<string>(qs('dp', '15') || '15'); // % discount
  const [extraPct, setExtraPct] = useState<string>(qs('xp', '0') || '0'); // stacked extra % discount
  const [fixedOff, setFixedOff] = useState<string>(qs('fx', '0') || '0'); // fixed amount off
  const [taxPct, setTaxPct] = useState<string>(qs('tx', '0') || '0'); // tax applied after discounts
  const [qty, setQty] = useState<string>(qs('q', '1') || '1'); // quantity

  // Reverse mode: target final price
  const [targetFinal, setTargetFinal] = useState<string>(qs('tf', '') || '');

  // Optional “compare to” competitor price
  const [compare, setCompare] = useState<string>(qs('cmp', '') || '');

  const [copied, setCopied] = useState<'link' | 'summary' | null>(null);

  // History
  const [history, setHistory] = useState<
    {
      ts: string;
      mode: Mode;
      original: number;
      discountPct: number;
      extraPct: number;
      fixedOff: number;
      taxPct: number;
      qty: number;
      finalEach: number;
      finalTotal: number;
      effectivePct: number;
    }[]
  >([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('df_history');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {}
  }, []);
  useEffect(() => localStorage.setItem('df_history', JSON.stringify(history.slice(0, 50))), [history]);

  // Keep URL synced
  useEffect(() => {
    setParams({
      c: currency,
      m: mode,
      op: parseNum(original),
      dp: parseNum(discountPct),
      xp: parseNum(extraPct),
      fx: parseNum(fixedOff),
      tx: parseNum(taxPct),
      q: Math.max(1, parseNum(qty)),
      tf: parseNum(targetFinal),
      cmp: parseNum(compare),
    });
  }, [currency, mode, original, discountPct, extraPct, fixedOff, taxPct, qty, targetFinal, compare]);

  // Numbers
  const o = useMemo(() => Math.max(0, parseNum(original)), [original]);
  const dp = useMemo(() => Math.max(0, parseNum(discountPct)), [discountPct]);
  const xp = useMemo(() => Math.max(0, parseNum(extraPct)), [extraPct]);
  const fx = useMemo(() => Math.max(0, parseNum(fixedOff)), [fixedOff]);
  const tx = useMemo(() => Math.max(0, parseNum(taxPct)), [taxPct]);
  const q = useMemo(() => Math.max(1, parseNum(qty)), [qty]);
  const cmp = useMemo(() => Math.max(0, parseNum(compare)), [compare]);
  const tf = useMemo(() => Math.max(0, parseNum(targetFinal)), [targetFinal]);

  // Core math
  const {
    discountedEachBeforeTax,
    taxEach,
    finalEach,
    finalTotal,
    totalSavings,
    totalSavingsPct,
    effectivePct,
    needPctForTarget, // reverse mode
    pricePerUnit,
  } = useMemo(() => {
    // Sequential discounts: first % discount, then extra %, then fixed off
    const afterFirst = o * (1 - dp / 100);
    const afterSecond = afterFirst * (1 - xp / 100);
    const discountedEachBeforeTax = Math.max(0, afterSecond - fx);

    const taxEach = (discountedEachBeforeTax * tx) / 100;
    const finalEach = discountedEachBeforeTax + taxEach;
    const finalTotal = finalEach * q;

    const originalTotal = o * q;
    const totalSavings = Math.max(0, originalTotal - finalTotal);
    const totalSavingsPct = originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0;

    // Effective discount vs original (pre-tax)
    const effectivePct = o > 0 ? ((o - discountedEachBeforeTax) / o) * 100 : 0;

    const pricePerUnit = finalEach; // already per unit

    // Reverse: what single combined % off (single-step, pre-tax) is needed to reach target finalEach (including tax)?
    // If target is given (tf), solve for x where: target = (o * (1 - x) - fx)* (1 + tx%) after also applying extra%?
    // We'll assume same structure: first dp%, then xp%, then fx, then +tax.
    // We solve for required dp (keeping xp, fx, tx fixed). targetFinalEach = (((o*(1-dp) )*(1 - xp)) - fx) * (1 + tx%)
    // Rearranging:
    // (((o*(1-dp))*(1 - xp)) - fx) = target / (1 + tx%)
    // o*(1-dp)*(1-xp) = target/(1+tx%) + fx
    // (1-dp) = (target/(1+tx%) + fx) / (o*(1-xp))
    // dp = 1 - (...)  -> convert to %
    let needPctForTarget = 0;
    // only compute if o>0 and xp<100% and target provided
    if (o > 0 && 1 - xp / 100 > 0 && tf > 0) {
      const rhs = tf / (1 + tx / 100) + fx;
      const denom = o * (1 - xp / 100);
      const oneMinusDp = denom > 0 ? rhs / denom : 0;
      needPctForTarget = (1 - oneMinusDp) * 100;
      if (!Number.isFinite(needPctForTarget)) needPctForTarget = 0;
    }

    return {
      discountedEachBeforeTax,
      taxEach,
      finalEach,
      finalTotal,
      totalSavings,
      totalSavingsPct,
      effectivePct,
      needPctForTarget,
      pricePerUnit,
    };
  }, [o, dp, xp, fx, tx, q, tf]);

  function saveHistory() {
    setHistory((h) => [
      {
        ts: new Date().toISOString(),
        mode,
        original: o,
        discountPct: dp,
        extraPct: xp,
        fixedOff: fx,
        taxPct: tx,
        qty: q,
        finalEach,
        finalTotal,
        effectivePct,
      },
      ...h,
    ]);
  }

  function exportHistoryCSV() {
    const rows: (string | number)[][] = [
      ['Time', 'Mode', 'Original', 'Discount %', 'Extra %', 'Fixed Off', 'Tax %', 'Qty', 'Final Each', 'Final Total', 'Effective %'],
      ...history.map((r) => [r.ts, r.mode, r.original, r.discountPct, r.extraPct, r.fixedOff, r.taxPct, r.qty, r.finalEach, r.finalTotal, r.effectivePct]),
    ];
    csvDownload('discount-history.csv', rows);
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  function copy(text: string, key: 'link' | 'summary') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  const presets = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 70];

  return (
    <div className="container mx-auto max-w-6xl px-3 py-6 sm:py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Tag className="h-6 w-6" /> Discount Finder
            </h1>
            <p className="text-sm text-muted-foreground">Before/after price, savings, and effective discount.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setMode(mode === 'forward' ? 'reverse' : 'forward')}>
              <ArrowLeftRight className="h-4 w-4" /> {mode === 'forward' ? 'Switch to Reverse' : 'Switch to Forward'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrency('BDT');
                setMode('forward');
                setOriginal('1200');
                setDiscountPct('15');
                setExtraPct('0');
                setFixedOff('0');
                setTaxPct('0');
                setQty('1');
                setCompare('');
                setTargetFinal('');
                setCopied(null);
              }}
              className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={saveHistory} className="gap-2">
              <Calculator className="h-4 w-4" /> Save Result
            </Button>
          </div>
        </GlassCard>

        {/* Inputs */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter original price and discounts. Choose mode for reverse calculation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v: Currency) => setCurrency(v)}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Original */}
            <div className="space-y-2">
              <Label htmlFor="original">Original Price (each)</Label>
              <Input id="original" inputMode="decimal" value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="e.g. 1200" />
            </div>

            {/* Qty */}
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 1" />
            </div>

            {/* % Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <div className="flex items-center gap-2">
                <Input id="discount" inputMode="decimal" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
                <div className="flex flex-wrap gap-1">
                  {presets.map((p) => (
                    <Badge key={p} variant={parseNum(discountPct) === p ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setDiscountPct(String(p))}>
                      {p}%
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Extra % */}
            <div className="space-y-2">
              <Label htmlFor="extra">Extra Discount (%)</Label>
              <Input id="extra" inputMode="decimal" value={extraPct} onChange={(e) => setExtraPct(e.target.value)} placeholder="e.g. 5" />
            </div>

            {/* Fixed off */}
            <div className="space-y-2">
              <Label htmlFor="fixed">Fixed Off (each)</Label>
              <Input id="fixed" inputMode="decimal" value={fixedOff} onChange={(e) => setFixedOff(e.target.value)} placeholder="e.g. 100" />
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <Label htmlFor="tax">Tax (%)</Label>
              <Input id="tax" inputMode="decimal" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} placeholder="e.g. 0 or 7.5" />
            </div>

            {/* Compare */}
            <div className="space-y-2">
              <Label htmlFor="compare">Competitor Price (each, optional)</Label>
              <Input id="compare" inputMode="decimal" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="e.g. 999" />
            </div>

            {/* Reverse target */}
            {mode === 'reverse' && (
              <div className="space-y-2">
                <Label htmlFor="target">Target Final Price (each)</Label>
                <Input id="target" inputMode="decimal" value={targetFinal} onChange={(e) => setTargetFinal(e.target.value)} placeholder="e.g. 950" />
              </div>
            )}
          </CardContent>
        </GlassCard>

        {/* Results */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Calculated summary for the discount structure.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Price After Discounts (pre-tax, each)</div>
              <div className="mt-1 text-xl font-semibold">{fmt(discountedEachBeforeTax, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Effective discount: {effectivePct.toFixed(2)}%</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Tax (each)</div>
              <div className="mt-1 text-xl font-semibold">{fmt(taxEach, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{tx}%</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Final Price (each)</div>
              <div className="mt-1 text-xl font-semibold">{fmt(finalEach, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Per unit</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Final Total</div>
              <div className="mt-1 text-xl font-semibold">{fmt(finalTotal, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Qty: {q}</div>
            </div>

            <div className="rounded-xl border p-4 sm:col-span-2 lg:col-span-2">
              <div className="text-xs text-muted-foreground">Savings</div>
              <div className="mt-1 text-xl font-semibold">
                {fmt(totalSavings, currency)} ({totalSavingsPct.toFixed(2)}%)
              </div>
              {cmp > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  vs competitor: {fmt(cmp, currency)} — You save {fmt(Math.max(0, (cmp - finalEach) * q), currency)} total
                </div>
              )}
            </div>

            {mode === 'reverse' && (
              <div className="rounded-xl border p-4 sm:col-span-2 lg:col-span-2">
                <div className="text-xs text-muted-foreground">Required % Discount (keeping extra%, fixed & tax)</div>
                <div className="mt-1 text-xl font-semibold">{Number.isFinite(needPctForTarget) ? `${needPctForTarget.toFixed(2)}%` : '—'}</div>
                <div className="mt-1 text-xs text-muted-foreground">To reach {tf ? fmt(tf, currency) : 'target'} per unit (final, after tax).</div>
              </div>
            )}
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              copy(
                `Original: ${fmt(o, currency)} | Disc: ${dp}% + ${xp}% & -${fmt(fx, currency)} | Tax: ${tx}% | Final(each): ${fmt(finalEach, currency)} | Total: ${fmt(
                  finalTotal,
                  currency,
                )} | Savings: ${fmt(totalSavings, currency)} (${totalSavingsPct.toFixed(2)}%)`,
                'summary',
              )
            }>
            {copied === 'summary' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Summary
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => shareUrl && copy(shareUrl, 'link')}>
            {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Share Link
          </Button>
          {history.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={exportHistoryCSV}>
              <Download className="h-4 w-4" /> Export History CSV
            </Button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <GlassCard className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent Calculations</CardTitle>
              <CardDescription>Last 50 are stored locally.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-background/80 backdrop-blur">
                    <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 text-muted-foreground">
                      <th className="text-left">Time</th>
                      <th className="text-left">Mode</th>
                      <th className="text-right">Original</th>
                      <th className="text-right">Disc %</th>
                      <th className="text-right">Extra %</th>
                      <th className="text-right">Fixed</th>
                      <th className="text-right">Tax %</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Final(each)</th>
                      <th className="text-right">Final(total)</th>
                      <th className="text-right">Effective %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                        <td className="text-left">{new Date(h.ts).toLocaleString()}</td>
                        <td className="text-left">{h.mode === 'forward' ? 'Forward' : 'Reverse'}</td>
                        <td className="text-right">{fmt(h.original, currency)}</td>
                        <td className="text-right">{h.discountPct}</td>
                        <td className="text-right">{h.extraPct}</td>
                        <td className="text-right">{fmt(h.fixedOff, currency)}</td>
                        <td className="text-right">{h.taxPct}</td>
                        <td className="text-right">{h.qty}</td>
                        <td className="text-right">{fmt(h.finalEach, currency)}</td>
                        <td className="text-right">{fmt(h.finalTotal, currency)}</td>
                        <td className="text-right">{h.effectivePct.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </GlassCard>
        )}
      </MotionGlassCard>
    </div>
  );
}
