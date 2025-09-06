"use client";

import { Calculator, Info, Percent } from "lucide-react";
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

export default function VatCalculatorClient() {
  // State
  const [mode, setMode] = React.useState<"add" | "remove">("add");
  const [price, setPrice] = React.useState<number>(1000);
  const [rate, setRate] = React.useState<number>(15);
  const [round2, setRound2] = React.useState<boolean>(true);
  const [currency, setCurrency] = React.useState<string>("BDT");

  // Derived
  const r = Math.max(0, rate) / 100;
  const calc = React.useMemo(() => computeVat({ price, r, mode }), [price, r, mode]);

  function resetAll() {
    setMode("add");
    setPrice(1000);
    setRate(15);
    setRound2(true);
    setCurrency("BDT");
  }

  const CSVRows: string[][] = [
    ["Mode", "Input Price", "Rate %", "Net", "Tax", "Gross"],
    [
      mode === "add" ? "Add Tax" : "Remove Tax",
      numStr(price),
      String(rate),
      numStr(calc.net),
      numStr(calc.tax),
      numStr(calc.gross),
    ],
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Percent}
        title="GST/VAT Calculator"
        description="Add tax to a net price or remove tax from a gross price."
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
          <CardDescription>
            Choose mode, set price and tax rate. Use quick chips for common rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton active={mode === "add"} onClick={() => setMode("add")}>
                Add Tax
              </ModeButton>
              <ModeButton active={mode === "remove"} onClick={() => setMode("remove")}>
                Remove Tax
              </ModeButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Add = price is net (pre‑tax). Remove = price is gross (tax‑inclusive).
            </p>
          </div>

          <div className="space-y-2">
            <InputField
              label={mode === "add" ? "Net Price" : "Gross Price"}
              id="price"
              inputMode="decimal"
              value={numDisplay(price)}
              onChange={(e) => setPrice(safeNum(e.target.value))}
            />

            <p className="text-xs text-muted-foreground">
              Enter the {mode === "add" ? "pre‑tax" : "tax‑inclusive"} amount.
            </p>
          </div>

          <div className="space-y-2">
            <InputField
              label="Tax Rate (%)"
              id="rate"
              type="number"
              min={0}
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[5, 7.5, 10, 12, 15].map((v) => (
                <QuickChip key={v} onClick={() => setRate(v)}>
                  {v}%
                </QuickChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <SwitchRow label="Round to 2 decimals" checked={round2} onCheckedChange={setRound2} />
            <div className="text-xs text-muted-foreground">
              Currency formatting defaults to your locale. Current: <strong>{currency}</strong>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {["BDT", "USD", "INR", "EUR"].map((c) => (
                <QuickChip key={c} onClick={() => setCurrency(c)}>
                  {c}
                </QuickChip>
              ))}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>Calculated amounts based on your inputs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultBox
              label="Net"
              value={formatMoney(calc.net, currency, round2)}
              onCopyText={formatMoney(calc.net, currency, round2)}
            />
            <ResultBox
              label="Tax"
              value={formatMoney(calc.tax, currency, round2)}
              onCopyText={formatMoney(calc.tax, currency, round2)}
            />
            <ResultBox
              label="Gross"
              value={formatMoney(calc.gross, currency, round2)}
              onCopyText={formatMoney(calc.gross, currency, round2)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Mode: {mode === "add" ? "Add Tax" : "Remove Tax"}</Badge>
            <Badge variant="outline">Rate: {rate}%</Badge>
            <Badge variant="outline">Currency: {currency}</Badge>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              Add Tax: gross = net × (1 + r). Remove Tax: net = gross ÷ (1 + r). Tax = gross − net.
            </span>
          </div>

          <div className="pt-2">
            <ExportCSVButton
              variant="default"
              filename="vat-calculation.csv"
              getRows={() => CSVRows}
            />
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

// Components
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
  onCopyText,
}: {
  label: string;
  value: string;
  onCopyText: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton size="sm" getText={() => onCopyText} />
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// Logic
function computeVat({ price, r, mode }: { price: number; r: number; mode: "add" | "remove" }) {
  const p = Math.max(0, Number(price) || 0);
  const rate = Math.max(0, Number(r) || 0);
  let net = 0,
    gross = 0,
    tax = 0;

  if (mode === "add") {
    net = p;
    gross = p * (1 + rate);
    tax = gross - net;
  } else {
    gross = p;
    net = rate === 0 ? p : p / (1 + rate);
    tax = gross - net;
  }

  return { net, tax, gross };
}

// Utils
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
function formatMoney(n: number, currency: string, round2: boolean) {
  const val = round2 ? Math.round(n * 100) / 100 : n;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(val);
  } catch {
    return `${new Intl.NumberFormat().format(val)} ${currency}`;
  }
}
