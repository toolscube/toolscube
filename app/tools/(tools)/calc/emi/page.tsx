"use client";

import { Calculator, Calendar as CalendarIcon, Download, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";

// Types
type TermMode = "years" | "months";
type Currency = "BDT" | "USD" | "INR";

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

// Utils
function parseNum(n: string | number): number {
  const v = typeof n === "number" ? n : Number(String(n).replace(/,/g, "").trim());
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number, currency: Currency) {
  const code = currency === "BDT" ? "BDT" : currency === "INR" ? "INR" : "USD";
  const locale = currency === "USD" ? "en-US" : "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

function fmtInt(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function addMonths(date: Date, m: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d;
}

function yyyymm(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Core EMI math
function computeEMI(P: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return months > 0 ? P / months : 0;
  const factor = (1 + r) ** months;
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

  if (principal <= 0 || months <= 0) {
    return { schedule, totalInterest: 0, totalPayment: 0, actualMonths: 0 };
  }

  while (bal > 0 && i < 1200) {
    const opening = bal;
    const interest = r * opening;
    const principalPay = baseEmi - interest;
    let extraPay = Math.max(0, extra);

    if (principalPay + extraPay > opening) {
      // Near the end, avoid overpayment
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
    if (i > months * 2 && r === 0) break;
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
    window.history.replaceState({}, "", url.toString());
  };
  const get = (key: string, fallback?: string) => {
    if (!ready) return fallback;
    return new URLSearchParams(window.location.search).get(key) ?? fallback;
  };
  return { setParams, get, ready };
}

export default function EmiCalculatorClient() {
  const qp = useQueryParams();

  const [currency, setCurrency] = useState<Currency>((qp.get("c", "BDT") as Currency) || "BDT");
  const [principal, setPrincipal] = useState<string>(qp.get("p", "500000") || "500000");
  const [rate, setRate] = useState<string>(qp.get("r", "9.5") || "9.5");
  const [termMode, setTermMode] = useState<TermMode>(
    (qp.get("mode", "years") as TermMode) || "years",
  );
  const [term, setTerm] = useState<string>(qp.get("t", "3") || "3");
  const [extra, setExtra] = useState<string>(qp.get("x", "0") || "0");
  const [startDate, setStartDate] = useState<string>(
    qp.get("d", yyyymm(new Date())) || yyyymm(new Date()),
  );

  // Keep URL in sync
  useEffect(() => {
    if (!qp.ready) return;
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
    return termMode === "years" ? t * 12 : t;
  }, [term, termMode]);

  const numericPrincipal = useMemo(() => Math.max(0, parseNum(principal)), [principal]);
  const numericRate = useMemo(() => Math.max(0, parseNum(rate)), [rate]);
  const numericExtra = useMemo(() => Math.max(0, parseNum(extra)), [extra]);

  const { schedule, totalInterest, totalPayment, actualMonths } = useMemo(
    () => buildSchedule(numericPrincipal, numericRate, months, new Date(startDate), numericExtra),
    [numericPrincipal, numericRate, months, startDate, numericExtra],
  );

  const baseEmi = useMemo(
    () => computeEMI(numericPrincipal, numericRate, months),
    [numericPrincipal, numericRate, months],
  );

  const payoffDate = useMemo(() => {
    if (!schedule.length) return "";
    return schedule[schedule.length - 1]?.date ?? "";
  }, [schedule]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const csvRows = useMemo<(string | number)[][]>(() => {
    if (!schedule.length) return [];
    const head = [
      "Month",
      "Date",
      "Opening",
      "Interest",
      "Principal",
      "Extra",
      "Payment",
      "Closing",
    ] as const;
    const lines = schedule.map((r) => [
      r.month,
      r.date,
      r.opening,
      r.interest,
      r.principal,
      r.extra,
      r.payment,
      r.closing,
    ]);
    return [Array.from(head), ...lines];
  }, [schedule]);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Calculator}
        title="Loan / EMI Calculator"
        description="Monthly installment, total interest & amortization schedule."
        actions={
          <>
            <ResetButton
              onClick={() => {
                setCurrency("BDT");
                setPrincipal("500000");
                setRate("9.5");
                setTermMode("years");
                setTerm("3");
                setExtra("0");
                setStartDate(yyyymm(new Date()));
              }}
            />
            <CopyButton
              variant="default"
              label="Share"
              getText={() => shareUrl}
              disabled={!shareUrl}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription>Enter your loan details and optional extra payment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Currency */}
          <SelectField
            label="Currency"
            value={currency}
            onValueChange={(v) => setCurrency(v as Currency)}
            options={[
              { value: "BDT", label: "BDT (৳)" },
              { value: "USD", label: "USD ($)" },
              { value: "INR", label: "INR (₹)" },
            ]}
          />

          {/* Principal */}
          <InputField
            label="Loan Amount"
            id="principal"
            inputMode="decimal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 500000"
          />

          {/* Rate */}
          <InputField
            label="Annual Interest Rate (%)"
            id="rate"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 9.5"
          />

          {/* Term */}
          <InputField
            label={`Term (${termMode === "years" ? "years" : "months"})`}
            id="term"
            inputMode="numeric"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. 3"
          />

          {/* Term mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Term Mode</Label>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Badge
                variant={termMode === "years" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTermMode("years")}
              >
                Years
              </Badge>
              <Badge
                variant={termMode === "months" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTermMode("months")}
              >
                Months
              </Badge>
            </div>
          </div>

          {/* Start date */}
          <InputField
            label="Start Date"
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            icon={CalendarIcon}
          />

          {/* Extra payment */}
          <div className="space-y-2 lg:col-span-3">
            <InputField
              label="Extra Monthly Payment (Optional)"
              id="extra"
              inputMode="decimal"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="e.g. 1000"
            />
            <div className="text-xs text-muted-foreground">
              Paying extra each month can reduce total interest and end date.
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Summary */}
      <GlassCard className="my-4">
        <CardHeader className="flex items-end justify-between">
          <div>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Key numbers at a glance.</CardDescription>
          </div>

          <CopyButton size="sm" label="Copy EMI" getText={() => fmt(baseEmi, currency)} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">EMI (without extra)</div>
            <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
              {fmt(baseEmi, currency)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Base monthly installment</div>
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
            <div className="mt-1 text-xl font-semibold">{payoffDate || "—"}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {actualMonths ? `${fmtInt(actualMonths)} months` : ""}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ExportCSVButton
          variant="default"
          icon={Download}
          label="Download CSV"
          disabled={!csvRows.length}
          filename="emi-amortization.csv"
          getRows={() => csvRows}
        />
        <ActionButton
          icon={History}
          label="Print"
          onClick={() => {
            window.print();
          }}
        />
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
    </>
  );
}
