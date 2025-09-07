"use client";

import { Calculator, Info, PiggyBank } from "lucide-react";
import * as React from "react";
import { ActionButton, ExportCSVButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function SavingsGoalClient() {
  // Inputs
  const [goal, setGoal] = React.useState<number>(200000);
  const [current, setCurrent] = React.useState<number>(15000);
  const [rate, setRate] = React.useState<number>(8);
  const [useDate, setUseDate] = React.useState<boolean>(true);
  const [months, setMonths] = React.useState<number>(24);
  const [targetDate, setTargetDate] = React.useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 24);
    return d.toISOString().slice(0, 10);
  });
  const [begin, setBegin] = React.useState<boolean>(false);

  // Derived
  const n = React.useMemo(
    () =>
      useDate ? monthsBetween(new Date(), parseISO(targetDate)) : Math.max(1, Math.floor(months)),
    [useDate, targetDate, months],
  );
  const i = React.useMemo(() => Math.max(rate, 0) / 100 / 12, [rate]);

  const result = React.useMemo(() => {
    return computeSavings({ fv: goal, pv: current, monthlyRate: i, months: n, begin });
  }, [goal, current, i, n, begin]);

  const schedule = React.useMemo(
    () => buildSchedule({ pv: current, pmt: result.monthly, monthlyRate: i, months: n, begin }),
    [current, result.monthly, i, n, begin],
  );

  // Actions
  function resetAll() {
    setGoal(200000);
    setCurrent(15000);
    setRate(8);
    setUseDate(true);
    setMonths(24);
    const d = new Date();
    d.setMonth(d.getMonth() + 24);
    setTargetDate(d.toISOString().slice(0, 10));
    setBegin(false);
  }

  const CSVRows: string[][] = [
    ["Month", "Deposit", "Interest", "End Balance"],
    ...schedule.map((r) => [
      String(r.month),
      toMoney(r.deposit),
      toMoney(r.interest),
      toMoney(r.balance),
    ]),
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={PiggyBank}
        title="Savings Goal"
        description="How much you need to save each month to reach your target by a date."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton variant="default" icon={Calculator} label="Calculate" />
          </>
        }
      />

      {/* Inputs */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription>
            Set your goal, current savings, timeline, and expected annual return.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <InputField
              label="Goal Amount"
              id="goal"
              inputMode="numeric"
              value={num(goal)}
              onChange={(e) => setGoal(safeNum(e.target.value))}
            />

            <p className="text-xs text-muted-foreground">
              Total amount you want to have at the end.
            </p>
          </div>
          <div className="space-y-2">
            <InputField
              label="Current Savings"
              id="current"
              inputMode="numeric"
              value={num(current)}
              onChange={(e) => setCurrent(safeNum(e.target.value))}
            />

            <p className="text-xs text-muted-foreground">What you already have saved.</p>
          </div>

          <div className="space-y-2">
            <InputField
              label="Expected Annual Return (%)"
              id="rate"
              type="number"
              min={0}
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
            />

            <p className="text-xs text-muted-foreground">
              We compound monthly. Set 0% for no growth.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer" htmlFor="toggle-date">
                Use Target Date
              </Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Months</span>
                <Switch id="toggle-date" checked={useDate} onCheckedChange={setUseDate} />
                <span>Date</span>
              </div>
            </div>
            {useDate ? (
              <InputField
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            ) : (
              <InputField
                id="months"
                type="number"
                min={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value) || 1)}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {useDate
                ? `${n} month${n === 1 ? "" : "s"} until target.`
                : "Enter how many months you want to save."}
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SwitchRow
              label="Deposit at beginning of month"
              hint="Turn on if you plan to deposit at the start of each month."
              checked={begin}
              onCheckedChange={setBegin}
            />

            <div className="flex flex-wrap gap-2 h-fit">
              <QuickChip onClick={() => setRate(0)}>0% (Safe)</QuickChip>
              <QuickChip onClick={() => setRate(6)}>6%</QuickChip>
              <QuickChip onClick={() => setRate(8)}>8%</QuickChip>
              <QuickChip onClick={() => setRate(10)}>10%</QuickChip>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>Based on your inputs with monthly compounding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Monthly needed" value={toMoney(result.monthly)} highlight />
            <Stat label="Total contributions" value={toMoney(result.totalContrib)} />
            <Stat label="Total interest" value={toMoney(result.totalInterest)} />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                We assume {begin ? "beginning" : "end"}‑of‑month deposits.{" "}
                {i === 0 ? "No growth is applied." : `Annual rate ${rate} % compounded monthly.`}
              </span>
            </div>
            <ProgressBar
              progress={Math.min(
                100,
                Math.max(0, ((schedule.at(-1)?.balance || 0) / Math.max(goal, 1)) * 100),
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Months: {n}</Badge>
            <Badge variant="outline">Monthly rate: {(i * 100).toFixed(3)}%</Badge>
            <Badge variant="outline">Goal: {toMoney(goal)}</Badge>
          </div>
        </CardContent>
      </GlassCard>

      {/* Amortization / Schedule */}
      <GlassCard>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Monthly Schedule</CardTitle>
            <CardDescription>
              First {Math.min(12, n)} rows shown. Export CSV for full table.
            </CardDescription>
          </div>
          <ExportCSVButton
            variant="default"
            filename="savings-schedule.csv"
            getRows={() => CSVRows}
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Month</th>
                <th className="py-2 pr-3">Deposit</th>
                <th className="py-2 pr-3">Interest</th>
                <th className="py-2 pr-3">End Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slice(0, 12).map((r) => (
                <tr key={r.month} className="border-t">
                  <td className="py-2 pr-3">{r.month}</td>
                  <td className="py-2 pr-3">{toMoney(r.deposit)}</td>
                  <td className="py-2 pr-3">{toMoney(r.interest)}</td>
                  <td className="py-2 pr-3">{toMoney(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </GlassCard>
    </>
  );
}

// Components
function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border p-3", highlight && "bg-primary/5 border-primary/30")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function QuickChip({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition"
    >
      {children}
    </button>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-2 rounded-full bg-primary transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Math
function computeSavings({
  fv,
  pv,
  monthlyRate,
  months,
  begin,
}: {
  fv: number;
  pv: number;
  monthlyRate: number;
  months: number;
  begin: boolean;
}) {
  const r = Math.max(monthlyRate, 0);
  const n = Math.max(1, Math.floor(months));
  const growth = (1 + r) ** n;
  let pmt: number;
  if (r === 0) {
    pmt = (fv - pv) / n;
  } else {
    pmt = ((fv - pv * growth) * r) / (growth - 1);
    if (begin) pmt /= 1 + r;
  }
  const monthly = Math.max(0, pmt);

  const sched = buildSchedule({ pv, pmt: monthly, monthlyRate: r, months: n, begin });
  const totalContrib = sched.reduce((s, x) => s + x.deposit, 0);
  const endBalance = sched.at(-1)?.balance ?? pv;
  const totalInterest = endBalance - pv - totalContrib;

  return { monthly, totalContrib, totalInterest, endBalance };
}

function buildSchedule({
  pv,
  pmt,
  monthlyRate,
  months,
  begin,
}: {
  pv: number;
  pmt: number;
  monthlyRate: number;
  months: number;
  begin: boolean;
}) {
  const out: { month: number; deposit: number; interest: number; balance: number }[] = [];
  let bal = pv;
  for (let m = 1; m <= months; m++) {
    if (begin) {
      bal += pmt;
    }
    const interest = bal * monthlyRate;
    bal += interest;
    if (!begin) {
      bal += pmt;
    }
    out.push({ month: m, deposit: pmt, interest, balance: bal });
  }
  return out;
}

// Utils
function monthsBetween(a: Date, b: Date) {
  const start = new Date(a.getFullYear(), a.getMonth(), 1);
  const end = new Date(b.getFullYear(), b.getMonth(), 1);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (b.getDate() >= a.getDate()) months += 1;
  else months = Math.max(1, months);
  return Math.max(1, months);
}
function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function num(n: number) {
  return Number.isFinite(n) ? String(n) : "";
}
function safeNum(v: string) {
  const x = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(x) ? x : 0;
}
function toMoney(n: number, currency = "BDT") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return new Intl.NumberFormat().format(n);
  }
}
