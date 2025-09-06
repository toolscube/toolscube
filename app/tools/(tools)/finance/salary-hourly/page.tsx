"use client";

import { Calculator, Info, Timer } from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Types */
type SalaryResults = ReturnType<typeof fromSalary> & { mode: "salary" };
type HourlyResults = ReturnType<typeof fromHourly> & { mode: "hourly" };

export default function SalaryHourlyClient() {
  // State
  const [mode, setMode] = React.useState<"salary" | "hourly">("salary");
  const [amount, setAmount] = React.useState<number>(600000);
  const [currency, setCurrency] = React.useState<string>("BDT");
  const [hoursPerWeek, setHoursPerWeek] = React.useState<number>(40);
  const [daysPerWeek, setDaysPerWeek] = React.useState<number>(5);
  const [weeksPerYear, setWeeksPerYear] = React.useState<number>(52);
  const [ptoDays, setPtoDays] = React.useState<number>(0);
  const [countPaidPTO, setCountPaidPTO] = React.useState<boolean>(true);
  const [round2, setRound2] = React.useState<boolean>(true);

  // Derived
  const yearHoursNominal = React.useMemo(
    () => weeksPerYear * hoursPerWeek,
    [weeksPerYear, hoursPerWeek],
  );
  const hoursPerDay = React.useMemo(
    () => (daysPerWeek > 0 ? hoursPerWeek / daysPerWeek : hoursPerWeek),
    [hoursPerWeek, daysPerWeek],
  );
  const yearHoursWorked = React.useMemo(() => {
    const ptoHours = countPaidPTO ? ptoDays * hoursPerDay : 0;
    return Math.max(1, yearHoursNominal - ptoHours);
  }, [yearHoursNominal, ptoDays, hoursPerDay, countPaidPTO]);

  const results = React.useMemo<SalaryResults | HourlyResults>(() => {
    if (mode === "salary") {
      const r = fromSalary(amount, {
        yearHoursNominal,
        yearHoursWorked,
        hoursPerWeek,
        daysPerWeek,
      });
      return { mode: "salary", ...r };
    }
    const r = fromHourly(amount, { yearHoursNominal, hoursPerWeek, daysPerWeek });
    return { mode: "hourly", ...r };
  }, [mode, amount, yearHoursNominal, yearHoursWorked, hoursPerWeek, daysPerWeek]);

  function resetAll() {
    setMode("salary");
    setAmount(600000);
    setCurrency("BDT");
    setHoursPerWeek(40);
    setDaysPerWeek(5);
    setWeeksPerYear(52);
    setPtoDays(0);
    setCountPaidPTO(true);
    setRound2(true);
  }

  // CSV
  const CSVRows: string[][] = [
    [
      "Mode",
      "Amount",
      "Currency",
      "Hours/Week",
      "Days/Week",
      "Weeks/Year",
      "PTO Days",
      "Count Paid PTO",
    ],
    [
      mode,
      numStr(amount),
      currency,
      numStr(hoursPerWeek),
      numStr(daysPerWeek),
      numStr(weeksPerYear),
      numStr(ptoDays),
      String(countPaidPTO),
    ],
    [],
    ["Label", "Value"],
    ...Object.entries(results.all as Record<string, number>).map(([k, v]) => [k, numStr(v)]),
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Timer}
        title="Salary ⇄ Hourly"
        description="Convert between annual salary and hourly/day/week/month pay rates."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton variant="default" icon={Calculator} label="Calculate" />
          </>
        }
      />

      {/* Inputs */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription>Switch modes and set schedule assumptions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton active={mode === "salary"} onClick={() => setMode("salary")}>
                From Salary
              </ModeButton>
              <ModeButton active={mode === "hourly"} onClick={() => setMode("hourly")}>
                From Hourly
              </ModeButton>
            </div>
            <p className="text-xs text-muted-foreground">
              From Salary: convert annual to hourly, etc. From Hourly: estimate annual and more.
            </p>
          </div>

          <div className="space-y-2">
            <InputField
              label={mode === "salary" ? "Annual Salary" : "Hourly Rate"}
              id="amount"
              inputMode="decimal"
              value={numDisplay(amount)}
              onChange={(e) => setAmount(safeNum(e.target.value))}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {["BDT", "USD", "INR", "EUR"].map((c) => (
                <QuickChip key={c} onClick={() => setCurrency(c)}>
                  {c}
                </QuickChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <InputField
              label="Hours per week"
              id="hpw"
              type="number"
              min={1}
              step="1"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">Typical full-time is 40.</p>
          </div>

          <div className="space-y-2">
            <InputField
              label="Days per week"
              id="dpw"
              type="number"
              min={1}
              max={7}
              step="1"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">Useful for PTO-aware effective hourly.</p>
          </div>

          <div className="space-y-2">
            <InputField
              label="Weeks per year"
              id="wpy"
              type="number"
              min={1}
              max={60}
              step="1"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(Number(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">52 weeks by default.</p>
          </div>

          <div className="space-y-2">
            <InputField
              label="Paid time off (days)"
              id="pto"
              type="number"
              min={0}
              step="1"
              value={ptoDays}
              onChange={(e) => setPtoDays(Number(e.target.value) || 0)}
            />
          </div>

          {/* Make Options span both columns at sm+ */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Options</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <SwitchRow label="Round to 2 decimals" checked={round2} onCheckedChange={setRound2} />
              <SwitchRow
                label="Count paid PTO when computing effective hourly"
                checked={countPaidPTO}
                onCheckedChange={setCountPaidPTO}
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>
            Nominal uses {fmtNumber(yearHoursNominal)} hours/year (hours × weeks). Effective hourly
            (salary mode) counts paid PTO.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {results.mode === "salary" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultBox
                label="Hourly (nominal)"
                value={fmtMoney(results.hourly, currency, round2)}
                copyText={fmtMoney(results.hourly, currency, round2)}
              />
              <ResultBox
                label="Daily"
                value={fmtMoney(results.daily, currency, round2)}
                copyText={fmtMoney(results.daily, currency, round2)}
              />
              <ResultBox
                label="Weekly"
                value={fmtMoney(results.weekly, currency, round2)}
                copyText={fmtMoney(results.weekly, currency, round2)}
              />
              <ResultBox
                label="Monthly"
                value={fmtMoney(results.monthly, currency, round2)}
                copyText={fmtMoney(results.monthly, currency, round2)}
              />
              <ResultBox
                label="Annual"
                value={fmtMoney(results.annual, currency, round2)}
                copyText={fmtMoney(results.annual, currency, round2)}
              />

              {ptoDays > 0 && countPaidPTO && (
                <ResultBox
                  label="Hourly (effective w/ PTO)"
                  value={fmtMoney(results.hourlyEffective, currency, round2)}
                  copyText={fmtMoney(results.hourlyEffective, currency, round2)}
                />
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultBox
                label="Annual"
                value={fmtMoney(results.annual, currency, round2)}
                copyText={fmtMoney(results.annual, currency, round2)}
              />
              <ResultBox
                label="Monthly"
                value={fmtMoney(results.monthly, currency, round2)}
                copyText={fmtMoney(results.monthly, currency, round2)}
              />
              <ResultBox
                label="Weekly"
                value={fmtMoney(results.weekly, currency, round2)}
                copyText={fmtMoney(results.weekly, currency, round2)}
              />
              <ResultBox
                label="Daily"
                value={fmtMoney(results.daily, currency, round2)}
                copyText={fmtMoney(results.daily, currency, round2)}
              />
              <ResultBox
                label="Hourly"
                value={fmtMoney(results.hourly, currency, round2)}
                copyText={fmtMoney(results.hourly, currency, round2)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Hours/week: {hoursPerWeek}</Badge>
            <Badge variant="outline">Days/week: {daysPerWeek}</Badge>
            <Badge variant="outline">Weeks/year: {weeksPerYear}</Badge>
            <Badge variant="outline">PTO days: {ptoDays}</Badge>
            <Badge variant="outline">Currency: {currency}</Badge>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              Nominal annual hours = weeks × hours/week. Effective hourly increases when paid PTO
              reduces worked hours.
            </span>
          </div>

          <div className="pt-2">
            <ExportCSVButton
              variant="default"
              filename="salary-hourly.csv"
              getRows={() => CSVRows}
            />
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

/** Small Components */
function ModeButton({
  active,
  onClick,
  children,
}: React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-sm transition",
        active ? "bg-primary/10 border-primary/40" : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
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

function ResultBox({
  label,
  value,
  copyText,
}: {
  label: string;
  value: string;
  copyText?: string | (() => string | Promise<string | null | undefined>);
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton size="sm" getText={copyText ?? value} />
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/** Logic */
function fromSalary(
  annual: number,
  opts: {
    yearHoursNominal: number;
    yearHoursWorked: number;
    hoursPerWeek: number;
    daysPerWeek: number;
  },
) {
  const A = Math.max(0, Number(annual) || 0);
  const { yearHoursNominal, yearHoursWorked, hoursPerWeek, daysPerWeek } = opts;
  const hourly = A / Math.max(1, yearHoursNominal);
  const hourlyEffective = A / Math.max(1, yearHoursWorked);
  const daily = hourly * (hoursPerWeek / Math.max(1, daysPerWeek));
  const weekly = hourly * hoursPerWeek;
  const monthly = A / 12;
  return {
    hourly,
    hourlyEffective,
    daily,
    weekly,
    monthly,
    annual: A,
    all: {
      "Hourly (nominal)": hourly,
      "Hourly (effective)": hourlyEffective,
      Daily: daily,
      Weekly: weekly,
      Monthly: monthly,
      Annual: A,
    },
  };
}

function fromHourly(
  hourly: number,
  opts: { yearHoursNominal: number; hoursPerWeek: number; daysPerWeek: number },
) {
  const H = Math.max(0, Number(hourly) || 0);
  const { yearHoursNominal, hoursPerWeek, daysPerWeek } = opts;
  const annual = H * yearHoursNominal;
  const daily = H * (hoursPerWeek / Math.max(1, daysPerWeek));
  const weekly = H * hoursPerWeek;
  const monthly = annual / 12;
  return {
    hourly: H,
    daily,
    weekly,
    monthly,
    annual,
    all: {
      Hourly: H,
      Daily: daily,
      Weekly: weekly,
      Monthly: monthly,
      Annual: annual,
    },
  };
}

/** Utils */
function numDisplay(n: number) {
  return Number.isFinite(n) ? String(n) : "";
}
function numStr(n: number) {
  return String(n);
}
function safeNum(v: string) {
  const x = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(x) ? x : 0;
}
function fmtMoney(n: number, currency: string, round2: boolean) {
  const val = round2 ? Math.round(n * 100) / 100 : n;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(val);
  } catch {
    return `${new Intl.NumberFormat().format(val)} ${currency}`;
  }
}
function fmtNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}
