"use client";

import {
  Calculator,
  Check,
  Copy,
  Download,
  Minus,
  Plus,
  RotateCcw,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// ===== Types =====
type Currency = "BDT" | "USD" | "INR";
type TipBaseMode = "pre-tax" | "post-tax";
type RoundMode = "nearest" | "up" | "down";
type RoundScope = "none" | "per-person" | "total";

// ===== Helpers =====
function parseNum(n: string | number): number {
  const v = typeof n === "number" ? n : Number(String(n).replace(/,/g, "").trim());
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number, currency: Currency) {
  const code = currency;
  const locale = currency === "USD" ? "en-US" : "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

function qs(k: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(k) ?? fallback;
}
function setParams(params: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  window.history.replaceState({}, "", url.toString());
}

// CSV helper (accepts string|number)
function csvDownload(filename: string, rows: (string | number)[][]) {
  const content = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function roundTo(n: number, mode: RoundMode): number {
  if (mode === "nearest") return Math.round(n);
  if (mode === "up") return Math.ceil(n);
  return Math.floor(n);
}

// ===== Page =====
export default function TipSplitterPage() {
  // Query-backed defaults
  const [currency, setCurrency] = useState<Currency>((qs("c", "BDT") as Currency) || "BDT");
  const [bill, setBill] = useState<string>(qs("b", "1200") || "1200");
  const [taxPct, setTaxPct] = useState<string>(qs("tx", "0") || "0");
  const [tipPct, setTipPct] = useState<string>(qs("tp", "10") || "10");
  const [tipBase, setTipBase] = useState<TipBaseMode>(
    (qs("tb", "pre-tax") as TipBaseMode) || "pre-tax",
  );
  const [people, setPeople] = useState<string>(qs("p", "2") || "2");

  const [roundScope, setRoundScope] = useState<RoundScope>(
    (qs("rs", "none") as RoundScope) || "none",
  );
  const [roundMode, setRoundMode] = useState<RoundMode>(
    (qs("rm", "nearest") as RoundMode) || "nearest",
  );

  const [copied, setCopied] = useState<"link" | "values" | null>(null);

  const [history, setHistory] = useState<
    {
      ts: string;
      bill: number;
      taxPct: number;
      tipPct: number;
      tipBase: TipBaseMode;
      people: number;
      total: number;
    }[]
  >([]);

  // Persist history
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ts_history");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {}
  }, []);
  useEffect(
    () => localStorage.setItem("ts_history", JSON.stringify(history.slice(0, 50))),
    [history],
  );

  // Keep URL in sync
  useEffect(() => {
    setParams({
      c: currency,
      b: parseNum(bill),
      tx: parseNum(taxPct),
      tp: parseNum(tipPct),
      tb: tipBase,
      p: Math.max(1, parseNum(people)),
      rs: roundScope,
      rm: roundMode,
    });
  }, [currency, bill, taxPct, tipPct, tipBase, people, roundScope, roundMode]);

  // Numbers
  const billN = useMemo(() => Math.max(0, parseNum(bill)), [bill]);
  const taxPctN = useMemo(() => Math.max(0, parseNum(taxPct)), [taxPct]);
  const tipPctN = useMemo(() => Math.max(0, parseNum(tipPct)), [tipPct]);
  const peopleN = useMemo(() => Math.max(1, parseNum(people)), [people]);

  // Core math
  const {
    tax,
    tipBaseAmount,
    tipAmount,
    subtotal,
    total,
    perPersonRaw,
    perPersonRounded,
    totalRounded,
    roundingAdjustment,
  } = useMemo(() => {
    const subtotal = billN; // bill is pre-tax subtotal
    const tax = (subtotal * taxPctN) / 100;
    const tipBaseAmount = tipBase === "pre-tax" ? subtotal : subtotal + tax;
    const tipAmount = (tipBaseAmount * tipPctN) / 100;
    const total = subtotal + tax + tipAmount;

    const perPersonRaw = total / peopleN;

    let perPersonRounded = perPersonRaw;
    let totalRounded = total;
    let roundingAdjustment = 0;

    if (roundScope === "per-person") {
      perPersonRounded = roundTo(perPersonRaw, roundMode);
      totalRounded = perPersonRounded * peopleN;
      roundingAdjustment = totalRounded - total;
    } else if (roundScope === "total") {
      totalRounded = roundTo(total, roundMode);
      perPersonRounded = totalRounded / peopleN;
      roundingAdjustment = totalRounded - total;
    }

    return {
      tax,
      tipBaseAmount,
      tipAmount,
      subtotal,
      total,
      perPersonRaw,
      perPersonRounded,
      totalRounded,
      roundingAdjustment,
    };
  }, [billN, taxPctN, tipPctN, tipBase, peopleN, roundScope, roundMode]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function copy(text: string, key: "link" | "values") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  function resetAll() {
    setCurrency("BDT");
    setBill("1200");
    setTaxPct("0");
    setTipPct("10");
    setTipBase("pre-tax");
    setPeople("2");
    setRoundScope("none");
    setRoundMode("nearest");
    setCopied(null);
  }

  function saveHistory() {
    setHistory((h) => [
      {
        ts: new Date().toISOString(),
        bill: billN,
        taxPct: taxPctN,
        tipPct: tipPctN,
        tipBase,
        people: peopleN,
        total: totalRounded,
      },
      ...h,
    ]);
  }

  function exportHistoryCSV() {
    const rows: (string | number)[][] = [
      ["Time", "Bill", "Tax %", "Tip %", "Tip Base", "People", "Total"],
      ...history.map((r) => [r.ts, r.bill, r.taxPct, r.tipPct, r.tipBase, r.people, r.total]),
    ];
    csvDownload("tip-split-history.csv", rows);
  }

  // UI helpers
  const presets = [5, 10, 12.5, 15, 18, 20];

  return (
    <div className="container mx-auto max-w-6xl px-3 py-6 sm:py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <UtensilsCrossed className="h-6 w-6" /> Tip Splitter
            </h1>
            <p className="text-sm text-muted-foreground">
              Split a bill across people with tax, tip, and smart rounding.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
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
            <CardTitle className="text-base">Bill & People</CardTitle>
            <CardDescription>
              Enter your bill details and how many people are splitting.
            </CardDescription>
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

            {/* Bill */}
            <div className="space-y-2">
              <Label htmlFor="bill">Bill Amount (pre-tax)</Label>
              <Input
                id="bill"
                inputMode="decimal"
                placeholder="e.g. 1200"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
              />
            </div>

            {/* People */}
            <div className="space-y-2">
              <Label htmlFor="people">People</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPeople(String(Math.max(1, parseNum(people) - 1)))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="people"
                  inputMode="numeric"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPeople(String(Math.max(1, parseNum(people) + 1)))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <Label htmlFor="tax">Tax (%)</Label>
              <Input
                id="tax"
                inputMode="decimal"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                placeholder="e.g. 0 or 7.5"
              />
            </div>

            {/* Tip */}
            <div className="space-y-2">
              <Label htmlFor="tip">Tip (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tip"
                  inputMode="decimal"
                  value={tipPct}
                  onChange={(e) => setTipPct(e.target.value)}
                />
                <div className="flex flex-wrap gap-1">
                  {presets.map((p) => (
                    <Badge
                      key={p}
                      variant={parseNum(tipPct) === p ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setTipPct(String(p))}
                    >
                      {p}%
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Tip Base */}
            <div className="space-y-2">
              <Label>Tip On</Label>
              <ToggleGroup
                type="single"
                value={tipBase}
                onValueChange={(v) => v && setTipBase(v as TipBaseMode)}
                className="justify-start"
              >
                <ToggleGroupItem value="pre-tax" aria-label="Pre-tax">
                  Pre-tax
                </ToggleGroupItem>
                <ToggleGroupItem value="post-tax" aria-label="Post-tax">
                  Post-tax
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                Post-tax = tip calculated on (bill + tax).
              </p>
            </div>

            {/* Rounding */}
            <div className="space-y-2 lg:col-span-3">
              <Label>Rounding</Label>
              <div className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={roundScope === "none" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setRoundScope("none")}
                  >
                    None
                  </Badge>
                  <Badge
                    variant={roundScope === "per-person" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setRoundScope("per-person")}
                  >
                    Per-person
                  </Badge>
                  <Badge
                    variant={roundScope === "total" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setRoundScope("total")}
                  >
                    Total
                  </Badge>
                </div>
                {roundScope !== "none" && (
                  <>
                    <span className="text-xs text-muted-foreground">Mode:</span>
                    <Badge
                      variant={roundMode === "nearest" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setRoundMode("nearest")}
                    >
                      Nearest
                    </Badge>
                    <Badge
                      variant={roundMode === "up" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setRoundMode("up")}
                    >
                      Up
                    </Badge>
                    <Badge
                      variant={roundMode === "down" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setRoundMode("down")}
                    >
                      Down
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Results */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Calculated summary for this bill.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Subtotal (pre-tax)</div>
              <div className="mt-1 text-xl font-semibold">{fmt(subtotal, currency)}</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Tax</div>
              <div className="mt-1 text-xl font-semibold">{fmt(tax, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{parseNum(taxPct)}%</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Tip</div>
              <div className="mt-1 text-xl font-semibold">{fmt(tipAmount, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {parseNum(tipPct)}% on{" "}
                {tipBase === "pre-tax" ? "pre-tax subtotal" : "subtotal + tax"}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Grand Total</div>
              <div className="mt-1 text-xl font-semibold">{fmt(totalRounded, currency)}</div>
              {roundScope !== "none" && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Rounding adj: {fmt(roundingAdjustment, currency)}
                </div>
              )}
            </div>
          </CardContent>
        </GlassCard>

        {/* Per-person */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Per-Person Share</CardTitle>
            <CardDescription>Even split across all people.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">People</div>
              <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
                <Users className="h-5 w-5" /> {peopleN}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Per-Person</div>
              <div className="mt-1 text-xl font-semibold">{fmt(perPersonRounded, currency)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                (raw: {fmt(perPersonRaw, currency)})
              </div>
            </div>
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
                `Subtotal: ${fmt(subtotal, currency)} | Tax: ${fmt(tax, currency)} | Tip: ${fmt(tipAmount, currency)} | Total: ${fmt(totalRounded, currency)} | Per-person: ${fmt(
                  perPersonRounded,
                  currency,
                )}`,
                "values",
              )
            }
          >
            {copied === "values" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{" "}
            Copy Summary
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => shareUrl && copy(shareUrl, "link")}
          >
            {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
            Share Link
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
              <CardTitle className="text-base">Recent Splits</CardTitle>
              <CardDescription>Last 50 are stored locally.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-background/80 backdrop-blur">
                    <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 text-muted-foreground">
                      <th className="text-left">Time</th>
                      <th className="text-right">Bill</th>
                      <th className="text-right">Tax %</th>
                      <th className="text-right">Tip %</th>
                      <th className="text-left">Tip On</th>
                      <th className="text-right">People</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                        <td className="text-left">{new Date(h.ts).toLocaleString()}</td>
                        <td className="text-right">{fmt(h.bill, currency)}</td>
                        <td className="text-right">{h.taxPct}</td>
                        <td className="text-right">{h.tipPct}</td>
                        <td className="text-left">
                          {h.tipBase === "pre-tax" ? "Pre-tax" : "Post-tax"}
                        </td>
                        <td className="text-right">{h.people}</td>
                        <td className="text-right">{fmt(h.total, currency)}</td>
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
