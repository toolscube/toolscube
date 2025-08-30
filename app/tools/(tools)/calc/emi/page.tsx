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

import { Calculator, Calendar as CalendarIcon, Check, Copy, Download, History, Link2, RotateCcw } from 'lucide-react';

// ---------- Types ----------
type TermMode = 'years' | 'months';
type Currency = 'BDT' | 'USD' | 'INR';

type Row = {
  month: number;
  date: string;
  opening: number;
  interest: number;
  principal: number;
  extra: number;
  payment: number;
  closing: number;
};

// ---------- Utils ----------
function parseNum(n: string | number): number {
  const v = typeof n === 'number' ? n : Number(String(n).replace(/,/g, '').trim());
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number, currency: Currency) {
  const code = currency === 'BDT' ? 'BDT' : currency === 'INR' ? 'INR' : 'USD';
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

function fmtInt(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function addMonths(date: Date, m: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d;
}

function yyyymm(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toCSV(rows: Row[]) {
  const head = ['Month', 'Date', 'Opening', 'Interest', 'Principal', 'Extra', 'Payment', 'Closing'];
  const lines = rows.map((r) => [r.month, r.date, r.opening, r.interest, r.principal, r.extra, r.payment, r.closing].join(','));
  return [head.join(','), ...lines].join('\n');
}

function download(filename: string, content: string, type = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Core EMI math
function computeEMI(P: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return months > 0 ? P / months : 0;
  const factor = Math.pow(1 + r, months);
  return (P * r * factor) / (factor - 1);
}

function buildSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  startDate: Date,
  extra: number,
): { schedule: Row[]; totalInterest: number; totalPayment: number; actualMonths: number } {
  const schedule: Row[] = [];
  let bal = principal;
  const baseEmi = computeEMI(principal, annualRatePct, months);
  const r = annualRatePct / 12 / 100;

  let totalInterest = 0;
  let totalPayment = 0;
  let i = 0;

  // Guard rails
  if (principal <= 0 || months <= 0) {
    return { schedule, totalInterest: 0, totalPayment: 0, actualMonths: 0 };
  }

  while (bal > 0 && i < 1200) {
    const opening = bal;
    const interest = r * opening;
    let principalPay = baseEmi - interest;
    let extraPay = Math.max(0, extra);

    // If near end, adjust so we don't overpay
    if (principalPay + extraPay > opening) {
      extraPay = Math.max(0, opening - principalPay);
    }

    const payment = Math.max(0, principalPay + interest + extraPay);
    const closing = Math.max(0, opening + interest - (principalPay + extraPay));

    totalInterest += interest;
    totalPayment += payment;

    schedule.push({
      month: i + 1,
      date: yyyymm(addMonths(startDate, i)),
      opening,
      interest,
      principal: principalPay,
      extra: extraPay,
      payment,
      closing,
    });

    bal = closing;
    i++;
    if (i > months * 2 && r === 0) break; // safety for no-interest long loops
  }

  return { schedule, totalInterest, totalPayment, actualMonths: schedule.length };
}

function useQueryParams() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const setParams = (params: Record<string, string | number | boolean>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, String(v));
    });
    window.history.replaceState({}, '', url.toString());
  };
  const get = (key: string, fallback?: string) => {
    if (!ready) return fallback;
    return new URLSearchParams(window.location.search).get(key) ?? fallback;
  };
  return { setParams, get, ready };
}

// ---------- Page ----------
export default function EmiCalculatorPage() {
  // Defaults tuned for BDT market
  const qp = useQueryParams();

  const [currency, setCurrency] = useState<Currency>('BDT');

  const [principal, setPrincipal] = useState<string>(qp.get('p', '500000') || '500000');
  const [rate, setRate] = useState<string>(qp.get('r', '9.5') || '9.5');
  const [termMode, setTermMode] = useState<TermMode>((qp.get('mode', 'years') as TermMode) || 'years');
  const [term, setTerm] = useState<string>(qp.get('t', '3') || '3'); // years by default
  const [extra, setExtra] = useState<string>(qp.get('x', '0') || '0');
  const [startDate, setStartDate] = useState<string>(qp.get('d', yyyymm(new Date())) || yyyymm(new Date()));

  const [copied, setCopied] = useState<'link' | 'emi' | null>(null);

  // Keep URL in sync
  useEffect(() => {
    qp.ready &&
      qp.setParams({
        p: parseNum(principal),
        r: parseNum(rate),
        mode: termMode,
        t: parseNum(term),
        x: parseNum(extra),
        d: startDate,
        c: currency,
      });
  }, [principal, rate, termMode, term, extra, startDate, currency, qp]);

  const months = useMemo(() => {
    const t = parseNum(term);
    return termMode === 'years' ? t * 12 : t;
  }, [term, termMode]);

  const numericPrincipal = useMemo(() => Math.max(0, parseNum(principal)), [principal]);
  const numericRate = useMemo(() => Math.max(0, parseNum(rate)), [rate]);
  const numericExtra = useMemo(() => Math.max(0, parseNum(extra)), [extra]);

  const { schedule, totalInterest, totalPayment, actualMonths } = useMemo(
    () => buildSchedule(numericPrincipal, numericRate, months, new Date(startDate), numericExtra),
    [numericPrincipal, numericRate, months, startDate, numericExtra],
  );

  const baseEmi = useMemo(() => computeEMI(numericPrincipal, numericRate, months), [numericPrincipal, numericRate, months]);

  const payoffDate = useMemo(() => {
    if (schedule.length === 0) return '';
    return schedule[schedule.length - 1]?.date ?? '';
  }, [schedule]);

  function run() {
    // Triggered via button; values already reactive
    // Could add validation toasts if you have a toast system
  }

  function resetAll() {
    setCurrency('BDT');
    setPrincipal('500000');
    setRate('9.5');
    setTermMode('years');
    setTerm('3');
    setExtra('0');
    setStartDate(yyyymm(new Date()));
    setCopied(null);
  }

  function copy(text: string, key: 'link' | 'emi') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  function downloadCSV() {
    if (!schedule.length) return;
    download('emi-amortization.csv', toCSV(schedule));
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container mx-auto max-w-6xl px-3 py-6 sm:py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Calculator className="h-6 w-6" /> Loan / EMI Calculator
            </h1>
            <p className="text-sm text-muted-foreground">Monthly installment, total interest & amortization schedule.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={run} className="gap-2">
              <Calculator className="h-4 w-4" /> Calculate
            </Button>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter your loan details and optional extra payment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            <div className="space-y-2">
              <Label htmlFor="principal">Loan Amount</Label>
              <Input id="principal" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g. 500000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Annual Interest Rate (%)</Label>
              <Input id="rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 9.5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term ({termMode === 'years' ? 'years' : 'months'})</Label>
              <Input id="term" inputMode="numeric" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. 3" />
            </div>

            <div className="space-y-2">
              <Label>Term Mode</Label>
              <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                <Badge variant={termMode === 'years' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setTermMode('years')}>
                  Years
                </Badge>
                <Badge variant={termMode === 'months' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setTermMode('months')}>
                  Months
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <div className="flex items-center gap-2">
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="extra">Extra Monthly Payment (Optional)</Label>
              <div className="flex items-center gap-3">
                <Input id="extra" inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. 1000" />
                <div className="text-xs text-muted-foreground">Paying extra each month can reduce total interest and end date.</div>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Summary */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Key numbers at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">EMI (without extra)</div>
              <div className="mt-1 flex items-center gap-2 text-xl font-semibold">{fmt(baseEmi, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Base monthly installment</div>
              <div className="mt-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => copy(fmt(baseEmi, currency), 'emi')}>
                  {copied === 'emi' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                </Button>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total Interest</div>
              <div className="mt-1 text-xl font-semibold">{fmt(totalInterest, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Over the loan life</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Total Payment</div>
              <div className="mt-1 text-xl font-semibold">{fmt(totalPayment, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Principal + Interest</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Payoff Date</div>
              <div className="mt-1 text-xl font-semibold">{payoffDate || '—'}</div>
              <div className="mt-1 text-xs text-muted-foreground">{actualMonths ? `${fmtInt(actualMonths)} months` : ''}</div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={downloadCSV} disabled={!schedule.length}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => shareUrl && copy(shareUrl, 'link')}>
            {copied === 'link' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} Copy Share Link
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <History className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Schedule */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Amortization Schedule</CardTitle>
            <CardDescription>Month-by-month breakdown including extra payments.</CardDescription>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <p className="text-sm text-muted-foreground">Enter loan details to see the schedule.</p>
            ) : (
              <div className="overflow-auto rounded-md border">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-background/80 backdrop-blur">
                    <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 text-muted-foreground">
                      <th className="text-left">#</th>
                      <th className="text-left">Date</th>
                      <th className="text-right">Opening</th>
                      <th className="text-right">Interest</th>
                      <th className="text-right">Principal</th>
                      <th className="text-right">Extra</th>
                      <th className="text-right">Payment</th>
                      <th className="text-right">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((r) => (
                      <tr key={r.month} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                        <td className="text-left">{r.month}</td>
                        <td className="text-left">{r.date}</td>
                        <td className="text-right">{fmt(r.opening, currency)}</td>
                        <td className="text-right">{fmt(r.interest, currency)}</td>
                        <td className="text-right">{fmt(r.principal, currency)}</td>
                        <td className="text-right">{fmt(r.extra, currency)}</td>
                        <td className="text-right">{fmt(r.payment, currency)}</td>
                        <td className="text-right">{fmt(r.closing, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
